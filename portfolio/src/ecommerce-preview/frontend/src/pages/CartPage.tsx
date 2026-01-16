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
        line1: '',
        line2: '',
        city: '',
        state: '',
        postalCode: '',
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
        <div className="min-h-screen bg-[#0a0a0f] py-12 px-4 relative overflow-hidden">
            {/* Aurora background */}
            <div className="absolute inset-0 aurora-bg opacity-30 fixed" />

            <Toaster position="top-right" toastOptions={{
                style: {
                    background: '#0a0a0f',
                    color: '#00fff2',
                    border: '1px solid #00fff2',
                },
            }} />

            {/* Payment Modal */}
            {showPayment && currentOrderId && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-xl cyber-glitch-in">
                    <div className="cyber-card w-full max-w-lg shadow-[0_0_50px_rgba(0,255,242,0.1)] relative">
                        <button
                            onClick={() => setShowPayment(false)}
                            className="absolute top-4 right-4 text-gray-500 hover:text-cyan-400 transition"
                        >
                            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>

                        <div className="p-8">
                            <h2 className="text-2xl font-bold text-white mb-2 flex items-center">
                                <span className="neon-text-cyan mr-3">SECURE</span> TRANSFER
                            </h2>
                            <p className="text-gray-400 mb-6 text-sm font-mono border-b border-white/10 pb-4">ENCRYPTED PAYMENT GATEWAY

                            <StripePaymentWrapper
                                orderId={currentOrderId}
                                onSuccess={handlePaymentSuccess}
                            />
                        </div>
                    </div>
                </div>
            )}

            <div className="max-w-6xl mx-auto relative z-10">
                <h1 className="text-4xl font-bold text-white mb-8 tracking-tighter">
                    <span className="neon-text-cyan">ACTIVE</span> INVENTORY
                </h1>

                {!cart || cart.items.length === 0 ? (
                    <div className="cyber-card p-12 text-center cyber-slide-up">
                        <div className="text-6xl mb-6 opacity-50">🕸️</div>
                        <p className="text-gray-400 mb-6 text-xl">INVENTORY EMPTY</p>
                        <Link to="/products" className="cyber-btn inline-block">
                            INITIATE BROWSING
                        </Link>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Cart Items */}
                        <div className="lg:col-span-2 space-y-4 cyber-stagger">
                            {cart.items.map((item: any) => (
                                <div key={item._id} className="cyber-card p-0 flex flex-col sm:flex-row items-center overflow-hidden group">
                                    <div className="w-full sm:w-32 h-32 bg-slate-900 flex-shrink-0 relative">
                                        {item.product?.images?.[0] ? (
                                            <img src={item.product.images[0]} className="w-full h-full object-cover cyber-image" />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-2xl font-bold text-white/30">?</div>
                                        )}
                                    </div>

                                    <div className="flex-1 p-6 w-full">
                                        <div className="flex justify-between items-start mb-2">
                                            <h3 className="text-white font-bold text-lg cyber-underline truncate pr-4">{item.product?.title || 'Unknown Asset'}</h3>
                                            <button
                                                onClick={() => handleRemove(item.product._id)}
                                                className="text-red-500 hover:text-red-400 opacity-50 hover:opacity-100 transition"
                                                title="Remove Asset"
                                            >
                                                ×
                                            </button>
                                        </div>
                                        <div className="flex justify-between items-end">
                                            <div className="flex items-center space-x-3 bg-black/20 rounded-lg p-1 border border-white/5">
                                                <button
                                                    onClick={() => handleUpdateQuantity(item.product._id, item.quantity - 1)}
                                                    className="w-8 h-8 flex items-center justify-center text-cyan-400 hover:bg-cyan-400/10 rounded transition"
                                                >
                                                    -
                                                </button>
                                                <span className="text-white font-mono w-6 text-center">{item.quantity}</span>
                                                <button
                                                    onClick={() => handleUpdateQuantity(item.product._id, item.quantity + 1)}
                                                    className="w-8 h-8 flex items-center justify-center text-cyan-400 hover:bg-cyan-400/10 rounded transition"
                                                >
                                                    +
                                                </button>
                                            </div>
                                            <div className="cyber-price text-xl">
                                                ${(item.price * item.quantity).toFixed(2)}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Summary */}
                        <div className="lg:col-span-1 cyber-slide-up" style={{ animationDelay: '0.4s' }}>
                            <div className="cyber-card p-6 sticky top-4 border-t-4 border-t-pink-500">
                                <h2 className="text-xl font-bold text-white mb-6 uppercase tracking-wider flex items-center">
                                    <span className="w-2 h-2 bg-pink-500 rounded-full mr-3 animate-pulse"></span>
                                    Requisition Data
                                </h2>

                                {/* Shipping Address Form */}
                                <div className="space-y-4 mb-8">
                                    <h3 className="text-xs font-bold text-cyan-400/70 uppercase tracking-widest mb-2">Delivery Coordinates</h3>
                                    <input
                                        type="text"
                                        placeholder="STREET ADDRESS *"
                                        value={shippingAddress.line1}
                                        onChange={(e) => setShippingAddress({ ...shippingAddress, line1: e.target.value })}
                                        className="cyber-input w-full text-sm"
                                    />
                                    <div className="grid grid-cols-2 gap-3">
                                        <input
                                            type="text"
                                            placeholder="CITY *"
                                            value={shippingAddress.city}
                                            onChange={(e) => setShippingAddress({ ...shippingAddress, city: e.target.value })}
                                            className="cyber-input w-full text-sm"
                                        />
                                        <input
                                            type="text"
                                            placeholder="STATE *"
                                            value={shippingAddress.state}
                                            onChange={(e) => setShippingAddress({ ...shippingAddress, state: e.target.value })}
                                            className="cyber-input w-full text-sm"
                                        />
                                    </div>
                                    <div className="grid grid-cols-2 gap-3">
                                        <input
                                            type="text"
                                            placeholder="POST CODE *"
                                            value={shippingAddress.postalCode}
                                            onChange={(e) => setShippingAddress({ ...shippingAddress, postalCode: e.target.value })}
                                            className="cyber-input w-full text-sm"
                                        />
                                        <input
                                            type="text"
                                            placeholder="COUNTRY"
                                            value={shippingAddress.country}
                                            onChange={(e) => setShippingAddress({ ...shippingAddress, country: e.target.value })}
                                            className="cyber-input w-full text-sm"
                                            disabled
                                        />
                                    </div>
                                </div>

                                <div className="space-y-3 mb-8 border-t border-white/10 pt-6">
                                    <div className="flex justify-between text-gray-400 font-mono text-sm">
                                        <span>SUBTOTAL</span>
                                        <span>${cart.totalPrice.toFixed(2)}</span>
                                    </div>
                                    <div className="flex justify-between text-gray-400 font-mono text-sm">
                                        <span>SHIPPING</span>
                                        <span className="text-cyan-400">NULL</span>
                                    </div>
                                    <div className="flex justify-between text-white font-bold text-xl pt-2">
                                        <span>TOTAL</span>
                                        <span className="cyber-price">${cart.totalPrice.toFixed(2)}</span>
                                    </div>
                                </div>
                                <button
                                    onClick={handleCheckout}
                                    disabled={checkoutLoading}
                                    className="cyber-btn w-full mb-4 disabled:opacity-50"
                                >
                                    {checkoutLoading ? 'CALCULATING...' : 'EXECUTE PAYMENT'}
                                </button>
                                <button
                                    onClick={handleClear}
                                    className="w-full text-xs text-red-500 hover:text-red-400 uppercase tracking-widest opacity-60 hover:opacity-100 transition"
                                >
                                    Purge Inventory
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
