import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { cartService } from '../services/cartService';
import { orderService } from '../services/orderService';
import type { ShippingAddress } from '../services/orderService';
import toast, { Toaster } from 'react-hot-toast';
import StripePaymentWrapper from '../components/StripePaymentWrapper';
import { useNavigate } from 'react-router-dom';

const CartPage: React.FC = () => {
    const navigate = useNavigate();
    const [cart, setCart] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [checkoutLoading, setCheckoutLoading] = useState(false);
    const [showPayment, setShowPayment] = useState(false);
    const [currentOrderId, setCurrentOrderId] = useState<string | null>(null);
    const [shippingAddress, setShippingAddress] = useState<ShippingAddress>({
        line1: '123 Main Street',
        line2: 'Apt 4B',
        city: 'San Francisco',
        state: 'CA',
        postalCode: '94102',
        country: 'US',
    });

    useEffect(() => {
        fetchCart();
    }, []);

    const fetchCart = async () => {
        try {
            const response = await cartService.getCart();
            setCart(response.data);
        } catch (error) {
            console.error('Failed to fetch cart:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateQuantity = async (productId: string, quantity: number) => {
        try {
            const response = await cartService.updateCartItem(productId, quantity);
            setCart(response.data);
            toast.success('Cart updated');
        } catch (error) {
            toast.error('Failed to update cart');
        }
    };

    const handleRemove = async (productId: string) => {
        try {
            const response = await cartService.removeFromCart(productId);
            setCart(response.data);
            toast.success('Item removed');
        } catch (error) {
            toast.error('Failed to remove item');
        }
    };

    const handleClear = async () => {
        if (!confirm('Clear your entire cart?')) return;
        try {
            await cartService.clearCart();
            setCart({ items: [], totalPrice: 0 });
            toast.success('Cart cleared');
        } catch (error) {
            toast.error('Failed to clear cart');
        }
    };

    const handleCheckout = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!shippingAddress.line1 || !shippingAddress.city || !shippingAddress.state || !shippingAddress.postalCode) {
            toast.error('Please fill in all required shipping fields');
            return;
        }

        setCheckoutLoading(true);
        try {
            const response = await orderService.createOrder(shippingAddress);
            setCurrentOrderId(response.data.data._id);
            setShowPayment(true);
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Failed to create order');
        } finally {
            setCheckoutLoading(false);
        }
    };

    const handlePaymentSuccess = () => {
        setShowPayment(false);
        navigate(`/order-success?orderId=${currentOrderId}`);
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
                <div className="text-white text-xl">Loading cart...</div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-900 py-12 px-4 relative overflow-hidden text-slate-200 font-sans">
            {/* Background enhancement */}
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-purple-900/20 via-slate-900 to-slate-900 pointer-events-none" />

            <Toaster position="top-right" toastOptions={{
                style: {
                    background: '#1e293b',
                    color: '#f8fafc',
                    border: '1px solid #334155',
                },
            }} />

            {/* Payment Modal */}
            {showPayment && currentOrderId && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-slate-800 w-full max-w-lg shadow-2xl rounded-2xl border border-slate-700 relative overflow-hidden">
                        <button
                            onClick={() => setShowPayment(false)}
                            className="absolute top-4 right-4 text-slate-400 hover:text-white transition bg-slate-700/50 rounded-full p-2"
                        >
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>

                        <div className="p-8">
                            <h2 className="text-2xl font-bold text-white mb-2 flex items-center gap-2">
                                <svg className="w-6 h-6 text-purple-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                </svg>
                                Secure Checkout
                            </h2>
                            <p className="text-slate-400 mb-6 text-sm border-b border-slate-700 pb-4">
                                Complete your purchase securely via Stripe.
                            </p>

                            <StripePaymentWrapper
                                orderId={currentOrderId}
                                onSuccess={handlePaymentSuccess}
                            />
                        </div>
                    </div>
                </div>
            )}

            <div className="max-w-7xl mx-auto relative z-10">
                <div className="flex items-center justify-between mb-8">
                    <h1 className="text-3xl font-bold text-white tracking-tight">
                        Shopping Cart
                    </h1>
                    <Link to="/products" className="text-purple-400 hover:text-purple-300 transition-colors flex items-center gap-2">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                        </svg>
                        Continue Shopping
                    </Link>
                </div>

                {!cart || cart.items.length === 0 ? (
                    <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl p-12 text-center border border-slate-700">
                        <div className="text-6xl mb-6 opacity-50">🛒</div>
                        <p className="text-slate-400 mb-6 text-xl">Your cart is empty</p>
                        <Link to="/products" className="inline-flex items-center px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium transition-colors">
                            Browse Products
                        </Link>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Cart Items */}
                        <div className="lg:col-span-2 space-y-4">
                            {cart.items.map((item: any) => (
                                <div key={item._id} className="bg-slate-800/50 backdrop-blur-sm rounded-xl border border-slate-700 p-4 flex flex-col sm:flex-row items-center gap-6 group hover:border-slate-600 transition-colors">
                                    <div className="w-full sm:w-32 h-32 bg-slate-900 rounded-lg flex-shrink-0 relative overflow-hidden">
                                        {item.product?.images?.[0] ? (
                                            <img src={item.product.images[0]} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" alt={item.product.title} />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-slate-600 font-bold text-2xl">?</div>
                                        )}
                                    </div>

                                    <div className="flex-1 w-full">
                                        <div className="flex justify-between items-start mb-2">
                                            <h3 className="text-white font-semibold text-lg line-clamp-1">{item.product?.title || 'Unknown Product'}</h3>
                                            <button
                                                onClick={() => handleRemove(item.product._id)}
                                                className="text-slate-500 hover:text-red-400 p-1 rounded-md hover:bg-slate-700 transition"
                                                title="Remove Item"
                                            >
                                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                                </svg>
                                            </button>
                                        </div>

                                        <p className="text-sm text-slate-400 mb-4">{item.product?.category || 'General'}</p>

                                        <div className="flex justify-between items-end">
                                            <div className="flex items-center bg-slate-900 rounded-lg border border-slate-700">
                                                <button
                                                    onClick={() => handleUpdateQuantity(item.product._id, item.quantity - 1)}
                                                    className="w-10 h-10 flex items-center justify-center text-slate-400 hover:text-white hover:bg-slate-800 rounded-l-lg transition"
                                                >
                                                    -
                                                </button>
                                                <span className="text-white font-medium w-8 text-center">{item.quantity}</span>
                                                <button
                                                    onClick={() => handleUpdateQuantity(item.product._id, item.quantity + 1)}
                                                    className="w-10 h-10 flex items-center justify-center text-slate-400 hover:text-white hover:bg-slate-800 rounded-r-lg transition"
                                                >
                                                    +
                                                </button>
                                            </div>
                                            <div className="text-xl font-bold text-white">
                                                ${(item.price * item.quantity).toFixed(2)}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Summary */}
                        <div className="lg:col-span-1">
                            <div className="bg-slate-800 rounded-2xl p-6 border border-slate-700 shadow-xl sticky top-4">
                                <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                                    Order Summary
                                </h2>

                                {/* Shipping Address Form */}
                                <div className="space-y-4 mb-8">
                                    <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">Shipping Details</h3>

                                    <div className="space-y-3">
                                        <input
                                            type="text"
                                            placeholder="Street Address"
                                            value={shippingAddress.line1}
                                            onChange={(e) => setShippingAddress({ ...shippingAddress, line1: e.target.value })}
                                            className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                                        />
                                        <div className="grid grid-cols-2 gap-3">
                                            <input
                                                type="text"
                                                placeholder="City"
                                                value={shippingAddress.city}
                                                onChange={(e) => setShippingAddress({ ...shippingAddress, city: e.target.value })}
                                                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                                            />
                                            <input
                                                type="text"
                                                placeholder="State"
                                                value={shippingAddress.state}
                                                onChange={(e) => setShippingAddress({ ...shippingAddress, state: e.target.value })}
                                                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                                            />
                                        </div>
                                        <div className="grid grid-cols-2 gap-3">
                                            <input
                                                type="text"
                                                placeholder="Postal Code"
                                                value={shippingAddress.postalCode}
                                                onChange={(e) => setShippingAddress({ ...shippingAddress, postalCode: e.target.value })}
                                                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                                            />
                                            <input
                                                type="text"
                                                placeholder="Country"
                                                value={shippingAddress.country}
                                                onChange={(e) => setShippingAddress({ ...shippingAddress, country: e.target.value })}
                                                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-3 text-slate-400 cursor-not-allowed"
                                                disabled
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-3 mb-8 border-t border-slate-700 pt-6">
                                    <div className="flex justify-between text-slate-400">
                                        <span>Subtotal</span>
                                        <span>${cart.totalPrice.toFixed(2)}</span>
                                    </div>
                                    <div className="flex justify-between text-slate-400">
                                        <span>Shipping</span>
                                        <span className="text-green-400">Free</span>
                                    </div>
                                    <div className="flex justify-between text-white font-bold text-xl pt-4 border-t border-slate-700 mt-4">
                                        <span>Total</span>
                                        <span>${cart.totalPrice.toFixed(2)}</span>
                                    </div>
                                </div>

                                <button
                                    onClick={handleCheckout}
                                    disabled={checkoutLoading}
                                    className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-bold py-4 rounded-xl shadow-lg shadow-purple-900/20 transition-all transform active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                >
                                    {checkoutLoading ? (
                                        <>
                                            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                            Processing...
                                        </>
                                    ) : (
                                        <>
                                            Proceed to Payment
                                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                                            </svg>
                                        </>
                                    )}
                                </button>

                                <div className="mt-4 flex items-center justify-center gap-2 text-slate-500 text-xs">
                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                    </svg>
                                    <span>Secured by connection via Stripe</span>
                                </div>

                                <button
                                    onClick={handleClear}
                                    className="w-full mt-4 text-sm text-red-500 hover:text-red-400 hover:bg-red-500/10 py-2 rounded-lg transition-colors"
                                >
                                    Clear Shopping Cart
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default CartPage;
