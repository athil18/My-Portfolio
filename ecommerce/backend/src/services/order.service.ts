import { pool } from '../config/pg';
import { supabaseAdmin } from '../config/supabase';
import { stripeService } from './external/stripe.service';
import { addEmailJob } from '../queues/email.queue';

/**
 * ORDER SERVICE — Supabase PostgreSQL Migration
 * Replaces Mongoose and MongoDB Transactions with PostgreSQL Transactions via `pg` Pool.
 */

export const validateStock = async (cartItems: Array<{ product_id: string; quantity: number }>) => {
    const stockErrors: string[] = [];
    
    // Fetch products in one go using Supabase Admin
    const { data: products, error } = await supabaseAdmin
        .from('products')
        .select('id, title, stock')
        .in('id', cartItems.map(item => item.product_id));

    if (error) throw new Error('Failed to validate stock');

    const productMap = new Map(products?.map(p => [p.id, p]));

    for (const item of cartItems) {
        const product = productMap.get(item.product_id);
        if (!product) {
            stockErrors.push(`Product ${item.product_id} not found`);
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

export const createOrder = async (userId: string, shippingAddress: any) => {
    const client = await pool.connect();
    
    try {
        await client.query('BEGIN');

        // 1. Get Cart
        const cartRes = await client.query('SELECT id, total_price FROM carts WHERE user_id = $1', [userId]);
        const cart = cartRes.rows[0];
        
        if (!cart) throw new Error('Cart is empty');

        // 2. Get Cart Items
        const itemsRes = await client.query(`
            SELECT ci.product_id, ci.quantity, ci.price, p.title, p.images 
            FROM cart_items ci
            JOIN products p ON p.id = ci.product_id
            WHERE ci.cart_id = $1
        `, [cart.id]);

        const validItems = itemsRes.rows;
        if (validItems.length === 0) throw new Error('No valid products in cart');

        // 3. Validate Stock
        await validateStock(validItems);

        // 4. Create Order Header
        const orderRes = await client.query(`
            INSERT INTO orders (
                user_id, total_amount, status, payment_status, 
                shipping_line1, shipping_line2, shipping_city, 
                shipping_state, shipping_postal_code, shipping_country
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
            RETURNING id, created_at, status, payment_status, total_amount
        `, [
            userId, cart.total_price, 'pending', 'unpaid',
            shippingAddress.line1, shippingAddress.line2, shippingAddress.city,
            shippingAddress.state, shippingAddress.postal_code, shippingAddress.country
        ]);

        const orderId = orderRes.rows[0].id;

        // 5. Create Order Items
        for (const item of validItems) {
            await client.query(`
                INSERT INTO order_items (order_id, product_id, title, image, quantity, price)
                VALUES ($1, $2, $3, $4, $5, $6)
            `, [
                orderId, item.product_id, item.title, 
                item.images?.[0] || '', item.quantity, item.price
            ]);
        }

        await client.query('COMMIT');

        // Format to match old Mongoose return structure
        return {
            _id: orderId,
            user: userId,
            items: validItems.map((i: any) => ({
                product: i.product_id,
                title: i.title,
                quantity: i.quantity,
                price: i.price,
                image: i.images?.[0]
            })),
            totalAmount: Number(cart.total_price),
            shippingAddress,
            status: 'pending',
            paymentStatus: 'unpaid',
            createdAt: orderRes.rows[0].created_at
        };

    } catch (err) {
        await client.query('ROLLBACK');
        throw err;
    } finally {
        client.release();
    }
};

export const createOrderFromCart = async (userId: string, shippingAddress: any) => {
    const order = await createOrder(userId, shippingAddress);

    const session = await stripeService.createCheckoutSession(
        userId,
        order.items.map((item: any) => ({
            title: item.title,
            price: item.price,
            quantity: item.quantity,
        })),
        order._id
    );

    await supabaseAdmin
        .from('orders')
        .update({ stripe_session_id: session.id })
        .eq('id', order._id);

    (order as any).stripeSessionId = session.id;

    return { order, checkoutUrl: session.url };
};

export const fulfillOrder = async (sessionId: string) => {
    const client = await pool.connect();
    
    try {
        await client.query('BEGIN');

        // 1. Get Order ID & Status
        const orderRes = await client.query(`
            SELECT id, user_id, payment_status, total_amount, status, created_at,
                   shipping_line1, shipping_line2, shipping_city, 
                   shipping_state, shipping_postal_code, shipping_country
            FROM orders WHERE stripe_session_id = $1 FOR UPDATE
        `, [sessionId]);

        const order = orderRes.rows[0];
        if (!order) throw new Error('Order not found for session');

        if (order.payment_status === 'paid') {
            await client.query('ROLLBACK');
            return order;
        }

        // 2. Get Order Items
        const itemsRes = await client.query('SELECT product_id, quantity, title, price FROM order_items WHERE order_id = $1', [order.id]);
        const items = itemsRes.rows;

        // 3. Decrement Stock
        for (const item of items) {
            const updateRes = await client.query(`
                UPDATE products 
                SET stock = stock - $1 
                WHERE id = $2 AND stock >= $1 
                RETURNING id
            `, [item.quantity, item.product_id]);
            
            if (updateRes.rowCount === 0) {
                throw new Error(`Failed to decrement stock for product ${item.product_id} - insufficient stock`);
            }
        }

        // 4. Update Order Status
        await client.query(`
            UPDATE orders 
            SET payment_status = 'paid', status = 'processing', updated_at = NOW() 
            WHERE id = $1
        `, [order.id]);

        // 5. Clear Cart (Atomic)
        await client.query(`
            DELETE FROM cart_items 
            WHERE cart_id = (SELECT id FROM carts WHERE user_id = $1)
        `, [order.user_id]);

        await client.query('COMMIT');

        // 6. Fetch User info for email
        const { data: profile } = await supabaseAdmin
            .from('profiles')
            .select('email, name')
            .eq('id', order.user_id)
            .single();

        // Map shipping address
        const shippingAddress = {
            line1: order.shipping_line1,
            line2: order.shipping_line2,
            city: order.shipping_city,
            state: order.shipping_state,
            postal_code: order.shipping_postal_code,
            country: order.shipping_country
        };

        // Format to match Mongoose shape for email
        const formattedOrder = {
            id: order.id,
            totalAmount: order.total_amount,
            items: items.map((item: any) => ({
                name: item.title,
                quantity: item.quantity,
                price: item.price,
            })),
            shippingAddress,
            status: 'processing',
            createdAt: order.created_at,
        };

        try {
            if (profile?.email) {
                await addEmailJob({
                    type: 'order-confirmation',
                    payload: {
                        email: profile.email,
                        name: profile.name,
                        order: formattedOrder
                    }
                });
            }
        } catch (error) {
            console.error('Failed to queue order confirmation email:', error);
        }

        return { ...formattedOrder, _id: order.id, paymentStatus: 'paid' };

    } catch (error) {
        await client.query('ROLLBACK');
        throw error;
    } finally {
        client.release();
    }
};

export const fulfillOrderByPaymentIntent = async (orderId: string) => {
    // Exact same logic as fulfillOrder but searches by order_id instead of stripe_session_id
    const client = await pool.connect();
    
    try {
        await client.query('BEGIN');

        const orderRes = await client.query(`
            SELECT id, user_id, payment_status, total_amount, status, created_at,
                   shipping_line1, shipping_line2, shipping_city, 
                   shipping_state, shipping_postal_code, shipping_country
            FROM orders WHERE id = $1 FOR UPDATE
        `, [orderId]);

        const order = orderRes.rows[0];
        if (!order) throw new Error('Order not found');

        if (order.payment_status === 'paid') {
            await client.query('ROLLBACK');
            return order;
        }

        const itemsRes = await client.query('SELECT product_id, quantity, title, price FROM order_items WHERE order_id = $1', [order.id]);
        const items = itemsRes.rows;

        for (const item of items) {
            const updateRes = await client.query(`
                UPDATE products 
                SET stock = stock - $1 
                WHERE id = $2 AND stock >= $1 
                RETURNING id
            `, [item.quantity, item.product_id]);
            
            if (updateRes.rowCount === 0) {
                throw new Error(`Failed to decrement stock for product ${item.product_id} - insufficient stock`);
            }
        }

        await client.query(`
            UPDATE orders 
            SET payment_status = 'paid', status = 'processing', updated_at = NOW() 
            WHERE id = $1
        `, [order.id]);

        await client.query(`
            DELETE FROM cart_items 
            WHERE cart_id = (SELECT id FROM carts WHERE user_id = $1)
        `, [order.user_id]);

        await client.query('COMMIT');
        return order;

    } catch (error) {
        await client.query('ROLLBACK');
        throw error;
    } finally {
        client.release();
    }
};

export const getOrderById = async (orderId: string, userId: string) => {
    const { data: order, error } = await supabaseAdmin
        .from('orders')
        .select(`
            id, total_amount, status, payment_status, created_at, stripe_session_id,
            shipping_line1, shipping_line2, shipping_city, shipping_state, shipping_postal_code, shipping_country,
            user_id,
            order_items ( product_id, title, quantity, price, image )
        `)
        .eq('id', orderId)
        .eq('user_id', userId)
        .single();

    if (error || !order) throw new Error('Order not found');

    return {
        _id: order.id,
        user: order.user_id,
        totalAmount: order.total_amount,
        status: order.status,
        paymentStatus: order.payment_status,
        createdAt: order.created_at,
        stripeSessionId: order.stripe_session_id,
        shippingAddress: {
            line1: order.shipping_line1,
            line2: order.shipping_line2,
            city: order.shipping_city,
            state: order.shipping_state,
            postalCode: order.shipping_postal_code,
            country: order.shipping_country
        },
        items: order.order_items.map((item: any) => ({
            product: { _id: item.product_id, title: item.title, image: item.image },
            quantity: item.quantity,
            price: item.price
        }))
    };
};

export const getUserOrders = async (userId: string, page: number = 1, limit: number = 10) => {
    const from = (page - 1) * limit;
    const to = from + limit - 1;

    const { data: orders, error, count } = await supabaseAdmin
        .from('orders')
        .select('id, total_amount, status, payment_status, created_at', { count: 'exact' })
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .range(from, to);

    if (error) throw new Error('Failed to fetch user orders');

    return {
        orders: orders.map((o: any) => ({ ...o, _id: o.id })), // Map id -> _id for compat
        pagination: {
            page,
            limit,
            total: count || 0,
            pages: Math.ceil((count || 0) / limit)
        }
    };
};

export const getAllOrders = async (page: number = 1, limit: number = 10) => {
    const from = (page - 1) * limit;
    const to = from + limit - 1;

    const { data: orders, error, count } = await supabaseAdmin
        .from('orders')
        .select(`
            id, total_amount, status, payment_status, created_at,
            profiles:user_id (name, email)
        `, { count: 'exact' })
        .order('created_at', { ascending: false })
        .range(from, to);

    if (error) throw new Error('Failed to fetch all orders');

    return {
        orders: orders.map((o: any) => ({
            ...o,
            _id: o.id,
            user: o.profiles ? { name: o.profiles.name, email: o.profiles.email } : null,
            profiles: undefined
        })),
        pagination: {
            page,
            limit,
            total: count || 0,
            pages: Math.ceil((count || 0) / limit)
        }
    };
};

export const updateOrderStatus = async (orderId: string, status: string) => {
    const { data: order, error } = await supabaseAdmin
        .from('orders')
        .update({ status, updated_at: new Date().toISOString() })
        .eq('id', orderId)
        .select()
        .single();

    if (error || !order) throw new Error('Order not found');
    return { ...order, _id: order.id };
};
