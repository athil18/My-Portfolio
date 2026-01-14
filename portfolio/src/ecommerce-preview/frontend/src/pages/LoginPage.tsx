import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline';

const LoginPage: React.FC = () => {
    const navigate = useNavigate();
    const { login } = useAuth();

    const [formData, setFormData] = useState({
        email: '',
        password: '',
    });
    const [showPassword, setShowPassword] = useState(false);
    const [rememberMe, setRememberMe] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
        setError('');
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            await login(formData.email, formData.password);
            navigate('/dashboard');
        } catch (err: any) {
            const message = err.response?.data?.message || 'Login failed. Please try again.';
            setError(message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-[#0a0a0f] px-4 py-12 relative overflow-hidden">
            {/* Aurora background */}
            <div className="absolute inset-0 aurora-bg opacity-20" />

            {/* Neon orbs */}
            <div className="aurora-orb absolute top-20 left-20 w-72 h-72 bg-cyan-500/30" />
            <div className="aurora-orb absolute bottom-20 right-20 w-96 h-96 bg-pink-500/30" style={{ animationDelay: '4s' }} />

            <div className="max-w-md w-full space-y-8 cyber-card p-8 cyber-slide-up relative z-10">
                {/* Header */}
                <div className="text-center">
                    <h2 className="text-4xl font-bold text-white mb-2"><span className="neon-text-cyan">Welcome</span> Back</h2>
                    <p className="text-gray-400">Sign in to your account</p>
                </div>


                {/* Error Message */}
                {error && (
                    <div className="bg-red-500/20 border border-red-500/50 text-red-200 px-4 py-3 rounded-lg text-sm ore-scale-in">
                        {error}
                    </div>
                )}

                {/* Form */}
                <form onSubmit={handleSubmit} className="mt-8 space-y-6">
                    {/* Email */}
                    <div className="ore-slide-up" style={{ animationDelay: '0.1s' }}>
                        <label htmlFor="email" className="block text-sm font-medium text-gray-200 mb-2">
                            Email Address
                        </label>
                        <input
                            id="email"
                            name="email"
                            type="email"
                            required
                            value={formData.email}
                            onChange={handleChange}
                            className="w-full px-4 py-3 ore-glass border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition ore-focus"
                            placeholder="you@example.com"
                        />
                    </div>

                    {/* Password */}
                    <div className="ore-slide-up" style={{ animationDelay: '0.2s' }}>
                        <label htmlFor="password" className="block text-sm font-medium text-gray-200 mb-2">
                            Password
                        </label>
                        <div className="relative">
                            <input
                                id="password"
                                name="password"
                                type={showPassword ? 'text' : 'password'}
                                required
                                value={formData.password}
                                onChange={handleChange}
                                className="w-full px-4 py-3 ore-glass border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition pr-12 ore-focus"
                                placeholder="Enter your password"
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition"
                            >
                                {showPassword ? (
                                    <EyeSlashIcon className="w-5 h-5" />
                                ) : (
                                    <EyeIcon className="w-5 h-5" />
                                )}
                            </button>
                        </div>
                    </div>

                    {/* Remember Me & Forgot Password */}
                    <div className="flex items-center justify-between ore-slide-up" style={{ animationDelay: '0.3s' }}>
                        <label className="flex items-center">
                            <input
                                type="checkbox"
                                checked={rememberMe}
                                onChange={(e) => setRememberMe(e.target.checked)}
                                className="w-4 h-4 rounded border-gray-300 text-purple-600 focus:ring-purple-500 focus:ring-offset-0 bg-white/10"
                            />
                            <span className="ml-2 text-sm text-gray-300">Remember me</span>
                        </label>
                        <Link to="/forgot-password" className="text-sm text-purple-400 hover:text-purple-300 transition">
                            Forgot password?
                        </Link>
                    </div>

                    {/* Submit Button */}
                    <button
                        type="submit"
                        disabled={loading}
                        className="ore-button w-full py-3 px-4 ore-gradient-primary text-white font-semibold rounded-lg ore-glow-hover disabled:opacity-50 disabled:cursor-not-allowed ore-slide-up"
                        style={{ animationDelay: '0.4s' }}
                    >
                        {loading ? (
                            <span className="flex items-center justify-center">
                                <div className="ore-loading-dots">
                                    <span></span>
                                    <span></span>
                                    <span></span>
                                </div>
                            </span>
                        ) : (
                            'Sign In'
                        )}
                    </button>
                </form>

                {/* Sign Up Link */}
                <p className="text-center text-sm text-gray-300 ore-slide-up" style={{ animationDelay: '0.5s' }}>
                    Don't have an account?{' '}
                    <Link to="/signup" className="text-purple-400 hover:text-purple-300 font-semibold transition">
                        Sign up
                    </Link>
                </p>
            </div>
        </div>
    );

};

export default LoginPage;
