import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { orderService } from '../services/orderService';
import Pagination from '../components/Pagination';

const OrdersPage: React.FC = () => {
    const [orders, setOrders] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, pages: 1 });

    useEffect(() => {
        fetchOrders();
    }, [pagination.page]);

    const fetchOrders = async () => {
        setLoading(true);
        try {
            const response = await orderService.getMyOrders(pagination.page);
            const result = response.data.data || response.data;

            setOrders(result.orders || []);
            if (result.pagination) {
                setPagination(result.pagination);
            }
        } catch (error) {
            console.error('Failed to fetch orders:', error);
        } finally {
            setLoading(false);
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'delivered': return 'bg-green-600';
            case 'processing': return 'bg-blue-600';
            case 'shipped': return 'bg-indigo-600';
            case 'cancelled': return 'bg-red-600';
            default: return 'bg-yellow-600';
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 py-12 px-4">
            <div className="max-w-6xl mx-auto">
                <h1 className="text-3xl font-bold text-white mb-8">My Orders</h1>

                {loading ? (
                    <div className="text-center py-12">
                        <div className="text-white text-xl">Loading orders...</div>
                    </div>
                ) : orders.length === 0 ? (
                    <div className="bg-white/10 backdrop-blur-lg rounded-xl p-12 text-center border border-white/20">
                        <p className="text-gray-400 mb-4">You haven't placed any orders yet</p>
                        <Link to="/products" className="px-6 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition">
                            Start Shopping
                        </Link>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {orders.map((order) => (
                            <div key={order._id} className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20 hover:border-white/30 transition">
                                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                                    <div>
                                        <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">Order ID</p>
                                        <p className="text-white font-mono text-sm">{order._id}</p>
                                        <p className="text-xs text-gray-500 mt-1">{new Date(order.createdAt).toLocaleDateString()} at {new Date(order.createdAt).toLocaleTimeString()}</p>
                                    </div>
                                    <div className="flex gap-4 items-center">
                                        <div className="text-right">
                                            <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">Total</p>
                                            <p className="text-white font-bold text-lg">${order.totalAmount.toFixed(2)}</p>
                                        </div>
                                        <span className={`px-3 py-1 rounded-full text-xs text-white capitalize font-medium ${getStatusColor(order.status)}`}>
                                            {order.status}
                                        </span>
                                        <Link
                                            to={`/orders/${order._id}`}
                                            className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition text-sm"
                                        >
                                            View Details
                                        </Link>
                                    </div>
                                </div>
                                {/* Visual indicator for items */}
                                <div className="mt-4 flex -space-x-2 overflow-hidden">
                                    {order.items.slice(0, 5).map((item: any, i: number) => (
                                        <div key={i} className="w-10 h-10 rounded-full border-2 border-slate-900 overflow-hidden bg-slate-800" title={item.title}>
                                            {item.image ? (
                                                <img src={item.image} alt={item.title} className="w-full h-full object-cover" />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center text-[10px] text-white font-bold bg-gradient-to-br from-purple-500 to-pink-500">
                                                    {item.title[0]}
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                    {order.items.length > 5 && (
                                        <div className="w-8 h-8 rounded-full bg-slate-800 border-2 border-slate-900 flex items-center justify-center text-[10px] text-gray-400 font-bold">
                                            +{order.items.length - 5}
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {!loading && pagination.pages > 1 && (
                    <div className="mt-8">
                        <Pagination
                            currentPage={pagination.page}
                            totalPages={pagination.pages}
                            onPageChange={(page) => setPagination({ ...pagination, page })}
                        />
                    </div>
                )}
            </div>
        </div>
    );
};

export default OrdersPage;
