import mongoose from 'mongoose';
import Order, { IOrder } from '../models/order.model';
import Product from '../models/product.model';
import Cart from '../models/cart.model';
import { stripeService } from './external/stripe.service';
import { addEmailJob } from '../queues/email.queue';

/**
 * Validate stock availability for all items in cart
 * @throws Error if any item has insufficient stock
 */
export const validateStock = async (cartItems: Array<{ product: any; quantity: number }>) => {
    const stockErrors: string[] = [];
    const productIds = cartItems.map(item => item.product._id || item.product);

    const products = await Product.find({ _id: { $in: productIds } });
    const productMap = new Map(products.map(p => [p._id.toString(), p]));

    for (const item of cartItems) {
        const productId = (item.product._id || item.product).toString();
        const product = productMap.get(productId);

        if (!product) {
            stockErrors.push(`Product ${productId} not found`);
            continue;
        }
        if (product.stock < item.quantity) {
            stockErrors.push(`Insufficient stock for "${product.title}": requested ${item.quantity}, available ${product.stock}`);
        }
    }

    if (stockErrors.length > 0) {
        throw new Error(stockErrors.join('; '));
    }
};

/**
 * Decrement stock for all items in an order (atomic operation)
 * @param orderId - Order to decrement stock for
 * @param session - MongoDB session for transaction
 */
export const decrementStock = async (orderId: string, session?: mongoose.ClientSession) => {
    const order = await Order.findById(orderId);
    if (!order) throw new Error('Order not found for stock decrement');

    for (const item of order.items) {
        const result = await Product.findOneAndUpdate(
            {
                _id: item.product,
                stock: { $gte: item.quantity }
            },
            { $inc: { stock: -item.quantity } },
            { session, new: true }
        );

        if (!result) {
            throw new Error(`Failed to decrement stock for product ${item.product} - insufficient stock`);
        }
    }
};

/**
 * Create order with stock validation
 */
export const createOrder = async (userId: string, shippingAddress: IOrder['shippingAddress']) => {
    const cart = await Cart.findOne({ user: userId }).populate('items.product');
    if (!cart || cart.items.length === 0) throw new Error('Cart is empty');

    const validItems = cart.items.filter((item: any) => item.product);
    if (validItems.length === 0) throw new Error('No valid products in cart');

    await validateStock(validItems);

    const order = await Order.create({
        user: userId,
        items: validItems.map((item: any) => ({
            product: item.product._id,
            title: item.product.title || 'Unknown Product',
            image: item.product.images?.[0] || '',
            quantity: item.quantity,
            price: item.price,
        })),
        totalAmount: cart.totalPrice,
        shippingAddress,
        status: 'pending',
        paymentStatus: 'unpaid',
    });

    return order;
};

export const createOrderFromCart = async (userId: string, shippingAddress: IOrder['shippingAddress']) => {
    const order = await createOrder(userId, shippingAddress);

    const session = await stripeService.createCheckoutSession(
        userId,
        order.items.map((item) => ({
            title: item.title,
            price: item.price,
            quantity: item.quantity,
        })),
        order._id.toString()
    );

    order.stripeSessionId = session.id;
    await order.save();

    return { order, checkoutUrl: session.url };
};

/**
 * Fulfill order with stock decrement and cart clearing (transactional)
 */
export const fulfillOrder = async (sessionId: string) => {
    const session = await mongoose.startSession();

    try {
        session.startTransaction();

        const order = await Order.findOne({ stripeSessionId: sessionId }).populate('user').session(session);
        if (!order) throw new Error('Order not found for session');

        if (order.paymentStatus === 'paid') {
            await session.abortTransaction();
            return order;
        }

        const decrementPromises = order.items.map((item) =>
            Product.findOneAndUpdate(
                {
                    _id: item.product,
                    stock: { $gte: item.quantity }
                },
                { $inc: { stock: -item.quantity } },
                { session, new: true }
            ).then(result => {
                if (!result) throw new Error(`Failed to decrement stock for product ${item.product} - insufficient stock`);
                return result;
            })
        );

        await Promise.all([
            ...decrementPromises,
            order.updateOne({
                paymentStatus: 'paid',
                status: 'processing'
            }, { session }),
            Cart.findOneAndUpdate(
                { user: order.user },
                { items: [], totalPrice: 0 },
                { session }
            )
        ]);

        await session.commitTransaction();

        const updatedOrder = await Order.findById(order._id).populate('user');
        if (!updatedOrder) throw new Error('Order not found after update');

        try {
            const user = updatedOrder.user as any;
            await addEmailJob({
                type: 'order-confirmation',
                payload: {
                    email: user.email,
                    name: user.name,
                    order: {
                        id: updatedOrder._id.toString(),
                        totalAmount: updatedOrder.totalAmount,
                        items: updatedOrder.items.map(item => ({
                            name: item.title,
                            quantity: item.quantity,
                            price: item.price,
                        })),
                        shippingAddress: updatedOrder.shippingAddress,
                        status: updatedOrder.status,
                        createdAt: updatedOrder.createdAt,
                    }
                }
            });
        } catch (error) {
            console.error('Failed to queue order confirmation email:', error);
        }

        return updatedOrder;
    } catch (error) {
        await session.abortTransaction();
        throw error;
    } finally {
        session.endSession();
    }
};

/**
 * Fulfill order by PaymentIntent ID (for PaymentIntent flow)
 */
export const fulfillOrderByPaymentIntent = async (orderId: string) => {
    const session = await mongoose.startSession();

    try {
        session.startTransaction();

        const order = await Order.findById(orderId).populate('user').session(session);
        if (!order) throw new Error('Order not found');

        if (order.paymentStatus === 'paid') {
            await session.abortTransaction();
            return order;
        }

        const decrementPromises = order.items.map((item) =>
            Product.findOneAndUpdate(
                {
                    _id: item.product,
                    stock: { $gte: item.quantity }
                },
                { $inc: { stock: -item.quantity } },
                { session, new: true }
            ).then(result => {
                if (!result) throw new Error(`Failed to decrement stock for product ${item.product} - insufficient stock`);
                return result;
            })
        );

        await Promise.all([
            ...decrementPromises,
            order.updateOne({
                paymentStatus: 'paid',
                status: 'processing'
            }, { session }),
            Cart.findOneAndUpdate(
                { user: order.user },
                { items: [], totalPrice: 0 },
                { session }
            )
        ]);

        await session.commitTransaction();

        const updatedOrder = await Order.findById(orderId).populate('user');
        if (!updatedOrder) throw new Error('Order not found after update');

        try {
            const user = updatedOrder.user as any;
            await addEmailJob({
                type: 'order-confirmation',
                payload: {
                    email: user.email,
                    name: user.name,
                    order: {
                        id: updatedOrder._id.toString(),
                        totalAmount: updatedOrder.totalAmount,
                        items: updatedOrder.items.map(item => ({
                            name: item.title,
                            quantity: item.quantity,
                            price: item.price,
                        })),
                        shippingAddress: updatedOrder.shippingAddress,
                        status: updatedOrder.status,
                        createdAt: updatedOrder.createdAt,
                    }
                }
            });
        } catch (error) {
            console.error('Failed to queue order confirmation email:', error);
        }

        return updatedOrder;
    } catch (error) {
        await session.abortTransaction();
        throw error;
    } finally {
        session.endSession();
    }
};

export const getOrderById = async (orderId: string, userId: string) => {
    const order = await Order.findOne({ _id: orderId, user: userId }).populate('items.product');
    if (!order) throw new Error('Order not found');
    return order;
};

export const getUserOrders = async (userId: string, page: number = 1, limit: number = 10) => {
    const skip = (page - 1) * limit;
    const [orders, total] = await Promise.all([
        Order.find({ user: userId }).sort({ createdAt: -1 }).skip(skip).limit(limit),
        Order.countDocuments({ user: userId })
    ]);

    return {
        orders,
        pagination: {
            page,
            limit,
            total,
            pages: Math.ceil(total / limit)
        }
    };
};

export const getAllOrders = async (page: number = 1, limit: number = 10) => {
    const skip = (page - 1) * limit;
    const [orders, total] = await Promise.all([
        Order.find().sort({ createdAt: -1 }).skip(skip).limit(limit).populate('user', 'name email'),
        Order.countDocuments()
    ]);

    return {
        orders,
        pagination: {
            page,
            limit,
            total,
            pages: Math.ceil(total / limit)
        }
    };
};

export const updateOrderStatus = async (orderId: string, status: string) => {
    const order = await Order.findByIdAndUpdate(orderId, { status }, { new: true });
    if (!order) throw new Error('Order not found');
    return order;
};
