import React, { useState, useEffect } from 'react';
import { adminService } from '../services/adminService';
import { orderService } from '../services/orderService';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import Pagination from '../components/Pagination';
import toast, { Toaster } from 'react-hot-toast';

const AdminPanel: React.FC = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState<'overview' | 'users' | 'products' | 'security' | 'orders'>('users');

    useEffect(() => {
        if (user?.role !== 'admin') {
            navigate('/dashboard');
        }
    }, [user, navigate]);

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 py-12 px-4">
            <Toaster position="top-right" />
            <div className="max-w-7xl mx-auto">
                <div className="bg-white/10 backdrop-blur-lg rounded-2xl shadow-2xl border border-white/20 p-8">
                    <div className="flex justify-between items-center mb-8">
                        <h1 className="text-3xl font-bold text-white">Admin Dashboard</h1>
                        <button
                            onClick={() => navigate('/dashboard')}
                            className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition"
                        >
                            Back to Dashboard
                        </button>
                    </div>

                    {/* Tab Navigation */}
                    <div className="flex space-x-4 border-b border-white/20 mb-8 overflow-x-auto">
                        {(['users', 'products', 'orders', 'security'] as const).map((tab) => (
                            <button
                                key={tab}
                                onClick={() => setActiveTab(tab)}
                                className={`px-4 py-2 font-medium transition-colors whitespace-nowrap ${activeTab === tab ? 'text-purple-400 border-b-2 border-purple-400' : 'text-gray-400 hover:text-white'}`}
                            >
                                {tab.charAt(0).toUpperCase() + tab.slice(1)}
                            </button>
                        ))}
                    </div>

                    {/* Tab Content */}
                    <div className="mt-6">
                        {activeTab === 'users' && <UserManagement />}
                        {activeTab === 'products' && <div className="text-white text-center py-12">Product Management coming soon...</div>}
                        {activeTab === 'orders' && <OrderManagement />}
                        {activeTab === 'security' && <div className="text-white text-center py-12">Admin Security settings coming soon...</div>}
                    </div>
                </div>
            </div>
        </div>
    );
};

const UserManagement: React.FC = () => {
    const [users, setUsers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [pagination, setPagination] = useState<any>(null);

    const fetchUsers = async () => {
        setLoading(true);
        try {
            const response = await adminService.getAllUsers(page, 10);
            setUsers(response.data.users);
            setPagination(response.data.pagination);
        } catch (error) {
            toast.error('Failed to fetch users');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, [page]);

    const handleRoleChange = async (userId: string, newRole: 'user' | 'admin') => {
        try {
            await adminService.changeUserRole(userId, newRole);
            toast.success('Role updated');
            fetchUsers();
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Failed to update role');
        }
    };

    const handleDeleteUser = async (userId: string) => {
        if (!confirm('Are you sure?')) return;
        try {
            await adminService.deleteUser(userId);
            toast.success('User deleted');
            fetchUsers();
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Failed to delete user');
        }
    };

    if (loading) return <div className="text-white text-center py-12">Loading users...</div>;

    return (
        <div className="space-y-6">
            <div className="overflow-x-auto">
                <table className="w-full text-left">
                    <thead className="bg-white/5 text-xs text-gray-400 uppercase tracking-wider">
                        <tr>
                            <th className="px-6 py-4">User</th>
                            <th className="px-6 py-4">Role</th>
                            <th className="px-6 py-4">Joined</th>
                            <th className="px-6 py-4 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                        {users.map((u) => (
                            <tr key={u._id} className="hover:bg-white/5 transition">
                                <td className="px-6 py-4">
                                    <div className="text-sm">
                                        <p className="text-white font-medium">{u.name}</p>
                                        <p className="text-gray-500">{u.email}</p>
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    <select
                                        value={u.role}
                                        onChange={(e) => handleRoleChange(u._id, e.target.value as 'user' | 'admin')}
                                        className="bg-slate-800 text-xs text-white border border-white/10 rounded px-2 py-1 outline-none focus:ring-1 focus:ring-purple-500"
                                    >
                                        <option value="user">User</option>
                                        <option value="admin">Admin</option>
                                    </select>
                                </td>
                                <td className="px-6 py-4 text-sm text-gray-400">
                                    {new Date(u.createdAt).toLocaleDateString()}
                                </td>
                                <td className="px-6 py-4 text-right">
                                    <button
                                        onClick={() => handleDeleteUser(u._id)}
                                        className="text-red-400 hover:text-red-300 transition text-sm font-medium"
                                    >
                                        Delete
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            {pagination && pagination.pages > 1 && (
                <div className="mt-8 flex justify-center">
                    <Pagination
                        currentPage={page}
                        totalPages={pagination.pages}
                        onPageChange={setPage}
                    />
                </div>
            )}
        </div>
    );
};

const OrderManagement: React.FC = () => {
    const [orders, setOrders] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [pagination, setPagination] = useState<any>(null);

    const fetchOrders = async () => {
        setLoading(true);
        try {
            const response = await orderService.getAdminOrders(page);
            setOrders(response.data.orders);
            setPagination(response.data.pagination);
        } catch (error) {
            toast.error('Failed to fetch orders');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchOrders();
    }, [page]);

    const handleStatusUpdate = async (id: string, status: string) => {
        try {
            await orderService.updateOrderStatus(id, status);
            toast.success('Status updated');
            fetchOrders();
        } catch (error) {
            toast.error('Failed to update status');
        }
    };

    if (loading) return <div className="text-white text-center py-12">Loading orders...</div>;

    return (
        <div className="space-y-6">
            <div className="overflow-x-auto">
                <table className="w-full text-left">
                    <thead className="bg-white/5 text-xs text-gray-400 uppercase tracking-wider">
                        <tr>
                            <th className="px-6 py-4">OrderID</th>
                            <th className="px-6 py-4">Customer</th>
                            <th className="px-6 py-4">Total</th>
                            <th className="px-6 py-4">Status</th>
                            <th className="px-6 py-4">Payment</th>
                            <th className="px-6 py-4 text-right">Details</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                        {orders.map((order) => (
                            <tr key={order._id} className="hover:bg-white/5 transition">
                                <td className="px-6 py-4 font-mono text-xs text-white">#{order._id.slice(-8)}</td>
                                <td className="px-6 py-4">
                                    <div className="text-sm">
                                        <p className="text-white font-medium">{order.user?.name}</p>
                                        <p className="text-gray-500">{order.user?.email}</p>
                                    </div>
                                </td>
                                <td className="px-6 py-4 text-white font-semibold">${order.totalAmount.toFixed(2)}</td>
                                <td className="px-6 py-4">
                                    <select
                                        value={order.status}
                                        onChange={(e) => handleStatusUpdate(order._id, e.target.value)}
                                        className="bg-slate-800 text-xs text-white border border-white/10 rounded px-2 py-1 outline-none focus:ring-1 focus:ring-purple-500"
                                    >
                                        <option value="pending">Pending</option>
                                        <option value="processing">Processing</option>
                                        <option value="shipped">Shipped</option>
                                        <option value="delivered">Delivered</option>
                                        <option value="cancelled">Cancelled</option>
                                    </select>
                                </td>
                                <td className="px-6 py-4">
                                    <span className={`px-2 py-0.5 rounded-full text-[10px] uppercase font-bold ${order.paymentStatus === 'paid' ? 'bg-green-600/20 text-green-400' : 'bg-red-600/20 text-red-400'
                                        }`}>
                                        {order.paymentStatus}
                                    </span>
                                </td>
                                <td className="px-6 py-4 text-right">
                                    <Link to={`/orders/${order._id}`} className="text-purple-400 hover:text-purple-300 transition text-sm">
                                        View
                                    </Link>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            {pagination && pagination.pages > 1 && (
                <div className="mt-8 flex justify-center">
                    <Pagination
                        currentPage={page}
                        totalPages={pagination.pages}
                        onPageChange={setPage}
                    />
                </div>
            )}
        </div>
    );
};

export default AdminPanel;
