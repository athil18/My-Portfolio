import Cart from '../models/cart.model';
import Product from '../models/product.model';

export const getCart = async (userId: string) => {
    let cart = await Cart.findOne({ user: userId }).populate('items.product');
    if (!cart) {
        cart = await Cart.create({ user: userId, items: [] });
    }
    return cart;
};

export const addToCart = async (userId: string, productId: string, quantity: number = 1) => {
    const product = await Product.findById(productId);
    if (!product) throw new Error('Product not found');
    if (product.stock < quantity) throw new Error('Insufficient stock');

    let cart = await Cart.findOne({ user: userId });
    if (!cart) {
        cart = await Cart.create({ user: userId, items: [] });
    }

    const existingItem = cart.items.find((item) => item.product.toString() === productId);

    if (existingItem) {
        existingItem.quantity += quantity;
    } else {
        cart.items.push({ product: productId as any, quantity, price: product.price });
    }

    await cart.save();
    return await Cart.findById(cart._id).populate('items.product');
};

export const updateCartItem = async (userId: string, productId: string, quantity: number) => {
    const cart = await Cart.findOne({ user: userId });
    if (!cart) throw new Error('Cart not found');

    const item = cart.items.find((item) => item.product.toString() === productId);
    if (!item) throw new Error('Item not in cart');

    if (quantity <= 0) {
        cart.items = cart.items.filter((item) => item.product.toString() !== productId);
    } else {
        item.quantity = quantity;
    }

    await cart.save();
    return await Cart.findById(cart._id).populate('items.product');
};

export const removeFromCart = async (userId: string, productId: string) => {
    const cart = await Cart.findOne({ user: userId });
    if (!cart) throw new Error('Cart not found');

    cart.items = cart.items.filter((item) => item.product.toString() !== productId);
    await cart.save();
    return await Cart.findById(cart._id).populate('items.product');
};

export const clearCart = async (userId: string) => {
    const cart = await Cart.findOne({ user: userId });
    if (!cart) throw new Error('Cart not found');
    cart.items = [];
    await cart.save();
    return cart;
};
