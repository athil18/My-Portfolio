import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { dashboardService } from '../services/dashboardService';
import StatCard from '../components/StatCard';
import ActivityFeed from '../components/ActivityFeed';
import QuickActions from '../components/QuickActions';

const DashboardPage: React.FC = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [summary, setSummary] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchDashboard();
    }, []);

    const fetchDashboard = async () => {
        try {
            const response = await dashboardService.getSummary();
            setSummary(response.data);
        } catch (error) {
            console.error('Failed to fetch dashboard:', error);
        } finally {
            setLoading(false);
        }
    };

    const getGreeting = () => {
        const hour = new Date().getHours();
        if (hour < 12) return 'Good morning';
        if (hour < 17) return 'Good afternoon';
        return 'Good evening';
    };

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <div className="min-h-screen ore-surface-0 relative overflow-hidden">
            {/* Animated background gradient */}
            <div className="absolute inset-0 ore-gradient-animated opacity-30 pointer-events-none" />

            <div className="container mx-auto px-4 py-8 relative z-10">
                {/* Header */}
                <div className="flex justify-between items-center mb-8 ore-slide-up">
                    <div>
                        <h1 className="text-3xl font-bold text-white">{getGreeting()}, {user?.name?.split(' ')[0]}! 👋</h1>
                        <p className="text-gray-400 mt-1">Here's what's happening with your account</p>
                    </div>
                    <div className="flex space-x-4">
                        <Link to="/profile" className="ore-button ore-glow-hover px-4 py-2 rounded-lg">
                            Profile
                        </Link>
                        {user?.role === 'admin' && (
                            <Link to="/admin" className="ore-button ore-glow-hover px-4 py-2 rounded-lg" style={{ background: 'linear-gradient(135deg, #4f46e5, #6366f1)' }}>
                                Admin
                            </Link>
                        )}
                        <button onClick={handleLogout} className="px-4 py-2 bg-red-600/80 hover:bg-red-600 text-white rounded-lg transition ore-glow-hover" style={{ '--glow-color': 'rgba(220, 38, 38, 0.4)' } as React.CSSProperties}>
                            Logout
                        </button>
                    </div>
                </div>

                {loading ? (
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        {[1, 2, 3, 4].map((i) => (
                            <div key={i} className="ore-glass rounded-xl h-32 ore-shimmer" />
                        ))}
                    </div>
                ) : (
                    <div className="space-y-8">
                        {/* Stats Grid */}
                        <div className="ore-stagger grid grid-cols-1 md:grid-cols-4 gap-4">
                            <StatCard
                                title="Total Orders"
                                value={summary?.stats?.totalOrders || 0}
                                icon={<svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" /></svg>}
                                gradient="ore-gradient-primary ore-glow-hover"
                            />
                            <StatCard
                                title="Cart Items"
                                value={summary?.stats?.cartItems || 0}
                                icon={<svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" /></svg>}
                                gradient="bg-gradient-to-br from-pink-600 to-rose-600 ore-glow-hover"
                            />
                            <StatCard
                                title="Wishlist"
                                value={summary?.stats?.wishlistItems || 0}
                                icon={<svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" /></svg>}
                                gradient="bg-gradient-to-br from-blue-600 to-cyan-600 ore-glow-hover"
                            />
                            <StatCard
                                title="Profile Complete"
                                value={`${summary?.stats?.profileCompletion || 0}%`}
                                icon={<svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
                                gradient="bg-gradient-to-br from-green-600 to-emerald-600 ore-glow-hover"
                                subtitle="Complete your profile"
                            />
                        </div>

                        {/* Quick Actions */}
                        <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
                            <h2 className="text-xl font-semibold text-white mb-4">Quick Actions</h2>
                            <QuickActions />
                        </div>

                        {/* Two Column Layout */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Recent Activity */}
                            <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
                                <h2 className="text-xl font-semibold text-white mb-4">Recent Activity</h2>
                                <ActivityFeed activities={summary?.recentActivity || []} />
                            </div>

                            {/* Account Info */}
                            <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
                                <h2 className="text-xl font-semibold text-white mb-4">Account Info</h2>
                                <div className="space-y-4">
                                    <div className="flex justify-between items-center py-3 border-b border-white/10">
                                        <span className="text-gray-400">Email</span>
                                        <span className="text-white">{user?.email}</span>
                                    </div>
                                    <div className="flex justify-between items-center py-3 border-b border-white/10">
                                        <span className="text-gray-400">Role</span>
                                        <span className="px-2 py-1 bg-purple-600 rounded text-white text-sm">{user?.role}</span>
                                    </div>
                                    <div className="flex justify-between items-center py-3">
                                        <span className="text-gray-400">Last Login</span>
                                        <span className="text-white">{summary?.lastLogin ? new Date(summary.lastLogin).toLocaleString() : 'N/A'}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default DashboardPage;
