import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { orderService } from '../services/orderService';

const OrderDetailsPage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const [order, setOrder] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (id) fetchOrder();
    }, [id]);

    const fetchOrder = async () => {
        setLoading(true);
        try {
            const response = await orderService.getOrderById(id!);
            setOrder(response.data);
        } catch (error) {
            console.error('Failed to fetch order details:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <div className="min-h-screen bg-slate-900 flex items-center justify-center text-white">Loading...</div>;
    if (!order) return <div className="min-h-screen bg-slate-900 flex items-center justify-center text-white">Order not found</div>;

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 py-12 px-4">
            <div className="max-w-4xl mx-auto">
                <div className="mb-8 flex justify-between items-center">
                    <div>
                        <Link to="/orders" className="text-purple-400 hover:text-purple-300 transition flex items-center gap-2 mb-2">
                            ← Back to Orders
                        </Link>
                        <h1 className="text-3xl font-bold text-white">Order Details</h1>
                    </div>
                    <div className="text-right">
                        <span className={`px-4 py-1.5 rounded-full text-sm text-white capitalize font-semibold ${order.status === 'delivered' ? 'bg-green-600' :
                            order.status === 'processing' ? 'bg-blue-600' : 'bg-yellow-600'
                            }`}>
                            {order.status}
                        </span>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Items List */}
                    <div className="md:col-span-2 space-y-4">
                        <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
                            <h2 className="text-lg font-bold text-white mb-4">Items</h2>
                            <div className="space-y-4">
                                {order.items.map((item: any, i: number) => (
                                    <div key={i} className="flex items-center justify-between border-b border-white/10 pb-4 last:border-0 last:pb-0">
                                        <div className="flex items-center gap-4">
                                            <div className="w-16 h-16 bg-slate-800 rounded-lg overflow-hidden flex-shrink-0 border border-white/10">
                                                {item.image ? (
                                                    <img src={item.image} alt={item.title} className="w-full h-full object-cover" />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center text-white font-bold bg-gradient-to-br from-purple-500 to-pink-500">
                                                        {item.title[0]}
                                                    </div>
                                                )}
                                            </div>
                                            <div>
                                                <p className="text-white font-medium">{item.title}</p>
                                                <p className="text-gray-400 text-sm">Qty: {item.quantity}</p>
                                            </div>
                                        </div>
                                        <p className="text-white font-bold">${(item.price * item.quantity).toFixed(2)}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Order Summary & Shipping */}
                    <div className="space-y-6">
                        <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
                            <h2 className="text-lg font-bold text-white mb-4">Summary</h2>
                            <div className="space-y-3 text-sm">
                                <div className="flex justify-between text-gray-300">
                                    <span>Payment Status</span>
                                    <span className={`capitalize ${order.paymentStatus === 'paid' ? 'text-green-400' : 'text-red-400'}`}>
                                        {order.paymentStatus}
                                    </span>
                                </div>
                                <div className="flex justify-between text-gray-300 border-t border-white/10 pt-3">
                                    <span>Total Amount</span>
                                    <span className="text-white font-bold text-lg">${order.totalAmount.toFixed(2)}</span>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
                            <h2 className="text-lg font-bold text-white mb-4">Shipping Address</h2>
                            <div className="text-gray-300 text-sm space-y-1">
                                <p>{order.shippingAddress.line1}</p>
                                {order.shippingAddress.line2 && <p>{order.shippingAddress.line2}</p>}
                                <p>{order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.postalCode}</p>
                                <p>{order.shippingAddress.country}</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default OrderDetailsPage;
