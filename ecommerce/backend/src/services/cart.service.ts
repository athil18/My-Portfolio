import { supabaseAdmin } from '../config/supabase';

/**
 * CART SERVICE — Supabase PostgreSQL Migration
 * Replaces Mongoose Cart model with Supabase Client queries for carts and cart_items.
 */

export const getCart = async (userId: string) => {
    // 1. Fetch cart
    let { data: cart, error: cartError } = await supabaseAdmin
        .from('carts')
        .select('id, total_price')
        .eq('user_id', userId)
        .single();

    // 2. If no cart exists, create one
    if (cartError || !cart) {
        const { data: newCart, error: createError } = await supabaseAdmin
            .from('carts')
            .insert({ user_id: userId, total_price: 0 })
            .select('id, total_price')
            .single();

        if (createError || !newCart) throw new Error('Failed to create cart');
        cart = newCart;
    }

    // 3. Fetch cart items with product details
    const { data: items } = await supabaseAdmin
        .from('cart_items')
        .select(`
            id, quantity, price,
            product:products (id, title, price, images, stock)
        `)
        .eq('cart_id', cart.id);

    // 4. Format to match Mongoose API contract
    return {
        _id: cart.id,
        user: userId,
        totalPrice: Number(cart.total_price),
        items: (items || []).map((item: any) => {
            const product = Array.isArray(item.product) ? item.product[0] : item.product;
            return {
                _id: item.id,
                product: {
                    _id: product?.id,
                    title: product?.title,
                    price: product?.price,
                    images: product?.images,
                    stock: product?.stock
                },
                quantity: item.quantity,
                price: Number(item.price)
            };
        })
    };
};

export const addToCart = async (userId: string, productId: string, quantity: number = 1) => {
    // 1. Get Product to check stock and price
    const { data: product, error: productError } = await supabaseAdmin
        .from('products')
        .select('id, price, stock')
        .eq('id', productId)
        .single();

    if (productError || !product) throw new Error('Product not found');
    if (product.stock < quantity) throw new Error('Insufficient stock');

    // 2. Get or Create Cart
    let { data: cart } = await supabaseAdmin
        .from('carts')
        .select('id')
        .eq('user_id', userId)
        .single();

    if (!cart) {
        const { data: newCart } = await supabaseAdmin
            .from('carts')
            .insert({ user_id: userId, total_price: 0 })
            .select('id')
            .single();
        cart = newCart;
    }

    if (!cart) throw new Error('Could not establish cart');

    // 3. Check if item already in cart
    const { data: existingItem } = await supabaseAdmin
        .from('cart_items')
        .select('id, quantity')
        .eq('cart_id', cart.id)
        .eq('product_id', productId)
        .single();

    if (existingItem) {
        await supabaseAdmin
            .from('cart_items')
            .update({ quantity: existingItem.quantity + quantity })
            .eq('id', existingItem.id);
    } else {
        await supabaseAdmin
            .from('cart_items')
            .insert({
                cart_id: cart.id,
                product_id: productId,
                quantity: quantity,
                price: product.price
            });
    }

    // Trigger `recalculate_cart_total` automatically handles the total_price update
    return getCart(userId);
};

export const updateCartItem = async (userId: string, productId: string, quantity: number) => {
    const { data: cart } = await supabaseAdmin
        .from('carts')
        .select('id')
        .eq('user_id', userId)
        .single();

    if (!cart) throw new Error('Cart not found');

    const { data: item } = await supabaseAdmin
        .from('cart_items')
        .select('id')
        .eq('cart_id', cart.id)
        .eq('product_id', productId)
        .single();

    if (!item) throw new Error('Item not in cart');

    if (quantity <= 0) {
        await supabaseAdmin
            .from('cart_items')
            .delete()
            .eq('id', item.id);
    } else {
        await supabaseAdmin
            .from('cart_items')
            .update({ quantity })
            .eq('id', item.id);
    }

    return getCart(userId);
};

export const removeFromCart = async (userId: string, productId: string) => {
    const { data: cart } = await supabaseAdmin
        .from('carts')
        .select('id')
        .eq('user_id', userId)
        .single();

    if (!cart) throw new Error('Cart not found');

    await supabaseAdmin
        .from('cart_items')
        .delete()
        .eq('cart_id', cart.id)
        .eq('product_id', productId);

    return getCart(userId);
};

export const clearCart = async (userId: string) => {
    const { data: cart } = await supabaseAdmin
        .from('carts')
        .select('id')
        .eq('user_id', userId)
        .single();

    if (!cart) throw new Error('Cart not found');

    await supabaseAdmin
        .from('cart_items')
        .delete()
        .eq('cart_id', cart.id);

    return getCart(userId);
};
