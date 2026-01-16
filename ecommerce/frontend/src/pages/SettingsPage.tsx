import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { settingsService } from '../services/settingsService';
import { validatePassword } from '../utils/passwordValidator';
import toast, { Toaster } from 'react-hot-toast';

type Tab = 'profile' | 'security' | 'notifications' | 'account';

const SettingsPage: React.FC = () => {
    const { logout } = useAuth();
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState<Tab>('security');
    const [loading, setLoading] = useState(false);

    const [passwordForm, setPasswordForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
    const [passwordStrength, setPasswordStrength] = useState<{ valid: boolean; message: string } | null>(null);

    const [notifications, setNotifications] = useState({
        email: true,
        push: false,
        marketing: false,
    });

    const [deletePassword, setDeletePassword] = useState('');
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

    const handlePasswordChange = async (e: React.FormEvent) => {
        e.preventDefault();
        if (passwordForm.newPassword !== passwordForm.confirmPassword) {
            toast.error('Passwords do not match');
            return;
        }
        if (passwordStrength && !passwordStrength.valid) {
            toast.error(passwordStrength.message);
            return;
        }
        setLoading(true);
        try {
            await settingsService.changePassword(passwordForm.currentPassword, passwordForm.newPassword);
            toast.success('Password updated successfully');
            setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Failed to change password');
        } finally {
            setLoading(false);
        }
    };

    const handleExportData = async () => {
        try {
            const response = await settingsService.exportData();
            const dataStr = JSON.stringify(response.data, null, 2);
            const blob = new Blob([dataStr], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'my-data.json';
            a.click();
            toast.success('Data exported successfully');
        } catch (error) {
            toast.error('Failed to export data');
        }
    };

    const handleDeleteAccount = async () => {
        if (!deletePassword) {
            toast.error('Please enter your password');
            return;
        }
        setLoading(true);
        try {
            await settingsService.deleteAccount(deletePassword);
            toast.success('Account deleted');
            logout();
            navigate('/login');
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Failed to delete account');
        } finally {
            setLoading(false);
        }
    };

    const tabs: { key: Tab; label: string; icon: string }[] = [
        { key: 'security', label: 'Security', icon: '🔒' },
        { key: 'notifications', label: 'Notifications', icon: '🔔' },
        { key: 'account', label: 'Account', icon: '⚙️' },
    ];

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 py-12 px-4">
            <Toaster position="top-right" />
            <div className="max-w-4xl mx-auto">
                <h1 className="text-3xl font-bold text-white mb-8">Settings</h1>

                <div className="flex flex-col md:flex-row gap-6">
                    {/* Sidebar */}
                    <div className="md:w-48 flex-shrink-0">
                        <div className="bg-white/10 backdrop-blur-lg rounded-xl p-4 border border-white/20">
                            {tabs.map((tab) => (
                                <button
                                    key={tab.key}
                                    onClick={() => setActiveTab(tab.key)}
                                    className={`w-full text-left px-4 py-3 rounded-lg mb-2 transition ${activeTab === tab.key ? 'bg-purple-600 text-white' : 'text-gray-300 hover:bg-white/10'
                                        }`}
                                >
                                    <span className="mr-2">{tab.icon}</span>
                                    {tab.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Content */}
                    <div className="flex-1 bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
                        {/* Security Tab */}
                        {activeTab === 'security' && (
                            <div>
                                <h2 className="text-xl font-semibold text-white mb-6">Change Password</h2>
                                <form onSubmit={handlePasswordChange} className="space-y-4 max-w-md">
                                    <input
                                        type="password"
                                        placeholder="Current Password"
                                        value={passwordForm.currentPassword}
                                        onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                                        className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                                        required
                                    />
                                    <input
                                        type="password"
                                        placeholder="New Password"
                                        value={passwordForm.newPassword}
                                        onChange={(e) => {
                                            setPasswordForm({ ...passwordForm, newPassword: e.target.value });
                                            setPasswordStrength(validatePassword(e.target.value));
                                        }}
                                        className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                                        required
                                    />
                                    {passwordStrength && (
                                        <p className={`text-xs ${passwordStrength.valid ? 'text-green-400' : 'text-red-400'}`}>
                                            {passwordStrength.message}
                                        </p>
                                    )}
                                    <input
                                        type="password"
                                        placeholder="Confirm New Password"
                                        value={passwordForm.confirmPassword}
                                        onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                                        className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                                        required
                                    />
                                    <button
                                        type="submit"
                                        disabled={loading}
                                        className="px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition disabled:opacity-50"
                                    >
                                        {loading ? 'Updating...' : 'Update Password'}
                                    </button>
                                </form>
                            </div>
                        )}

                        {/* Notifications Tab */}
                        {activeTab === 'notifications' && (
                            <div>
                                <h2 className="text-xl font-semibold text-white mb-6">Notification Preferences</h2>
                                <div className="space-y-4">
                                    {[
                                        { key: 'email', label: 'Email Notifications' },
                                        { key: 'push', label: 'Push Notifications' },
                                        { key: 'marketing', label: 'Marketing Emails' },
                                    ].map(({ key, label }) => (
                                        <div key={key} className="flex items-center justify-between py-3 border-b border-white/10">
                                            <span className="text-white">{label}</span>
                                            <button
                                                onClick={() => setNotifications({ ...notifications, [key]: !notifications[key as keyof typeof notifications] })}
                                                className={`w-12 h-6 rounded-full transition ${notifications[key as keyof typeof notifications] ? 'bg-purple-600' : 'bg-gray-600'
                                                    }`}
                                            >
                                                <div className={`w-5 h-5 bg-white rounded-full transition transform ${notifications[key as keyof typeof notifications] ? 'translate-x-6' : 'translate-x-1'
                                                    }`} />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Account Tab */}
                        {activeTab === 'account' && (
                            <div className="space-y-8">
                                <div>
                                    <h2 className="text-xl font-semibold text-white mb-4">Export Data</h2>
                                    <p className="text-gray-400 mb-4">Download a copy of all your account data.</p>
                                    <button
                                        onClick={handleExportData}
                                        className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition"
                                    >
                                        Export My Data
                                    </button>
                                </div>

                                <div className="border-t border-white/10 pt-8">
                                    <h2 className="text-xl font-semibold text-red-400 mb-4">Danger Zone</h2>
                                    <p className="text-gray-400 mb-4">Permanently delete your account. This action cannot be undone.</p>
                                    {!showDeleteConfirm ? (
                                        <button
                                            onClick={() => setShowDeleteConfirm(true)}
                                            className="px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg transition"
                                        >
                                            Delete Account
                                        </button>
                                    ) : (
                                        <div className="space-y-4 max-w-md">
                                            <input
                                                type="password"
                                                placeholder="Enter password to confirm"
                                                value={deletePassword}
                                                onChange={(e) => setDeletePassword(e.target.value)}
                                                className="w-full px-4 py-3 bg-white/10 border border-red-500/50 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500"
                                            />
                                            <div className="flex space-x-4">
                                                <button
                                                    onClick={handleDeleteAccount}
                                                    disabled={loading}
                                                    className="px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg transition disabled:opacity-50"
                                                >
                                                    Confirm Delete
                                                </button>
                                                <button
                                                    onClick={() => { setShowDeleteConfirm(false); setDeletePassword(''); }}
                                                    className="px-6 py-3 bg-white/10 hover:bg-white/20 text-white rounded-lg transition"
                                                >
                                                    Cancel
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SettingsPage;
