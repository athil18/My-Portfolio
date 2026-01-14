import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Navbar: React.FC = () => {
    const { user } = useAuth();
    const location = useLocation();

    const isActive = (path: string) => location.pathname === path;

    return (
        <nav className="bg-slate-900/95 backdrop-blur-md border-b border-slate-800 sticky top-0 z-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">
                    {/* Logo */}
                    <Link to="/products" className="flex items-center">
                        <img
                            src="/logo.png"
                            alt="MHD Commerce Logo"
                            className="h-10 w-auto object-contain hover:scale-105 transition-transform duration-200"
                        />
                    </Link>

                    {/* Navigation Links */}
                    <div className="hidden md:flex items-center gap-1">
                        <Link
                            to="/products"
                            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${isActive('/products')
                                ? 'bg-purple-600/20 text-purple-400'
                                : 'text-slate-400 hover:text-white hover:bg-slate-800'
                                }`}
                        >
                            Products
                        </Link>
                        <Link
                            to="/products/create"
                            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${isActive('/products/create')
                                ? 'bg-purple-600/20 text-purple-400'
                                : 'text-slate-400 hover:text-white hover:bg-slate-800'
                                }`}
                        >
                            Create
                        </Link>
                        <Link
                            to="/orders"
                            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${isActive('/orders')
                                ? 'bg-purple-600/20 text-purple-400'
                                : 'text-slate-400 hover:text-white hover:bg-slate-800'
                                }`}
                        >
                            Orders
                        </Link>
                    </div>

                    {/* Right Section */}
                    <div className="flex items-center gap-3">
                        <Link
                            to="/cart"
                            className="relative p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
                        >
                            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                            </svg>
                        </Link>

                        {user && (
                            <div className="flex items-center gap-3 pl-3 border-l border-slate-700">
                                <Link
                                    to="/profile"
                                    className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors"
                                >
                                    <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                                        <span className="text-white text-xs font-bold">{user.name?.charAt(0) || 'U'}</span>
                                    </div>
                                    <span className="text-sm font-medium hidden sm:inline">{user.name}</span>
                                </Link>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
