import React, { useState, useEffect } from 'react';
import { securityService } from '../services/securityService';
import toast, { Toaster } from 'react-hot-toast';

const SecuritySettingsPage: React.FC = () => {
    const [activeTab, setActiveTab] = useState<'2fa' | 'sessions'>('2fa');
    const [loading, setLoading] = useState(false);

    const [setup2FA, setSetup2FA] = useState<{ qrCode: string; secret: string } | null>(null);
    const [verifyCode, setVerifyCode] = useState('');
    const [backupCodes, setBackupCodes] = useState<string[] | null>(null);
    const [is2FAEnabled, setIs2FAEnabled] = useState(false);
    const [disableCode, setDisableCode] = useState('');

    const [sessions, setSessions] = useState<any[]>([]);

    useEffect(() => {
        if (activeTab === 'sessions') fetchSessions();
    }, [activeTab]);

    const fetchSessions = async () => {
        try {
            const response = await securityService.getSessions();
            setSessions(response.data.sessions);
        } catch (error) {
            toast.error('Failed to load sessions');
        }
    };

    const handleSetup2FA = async () => {
        setLoading(true);
        try {
            const response = await securityService.setup2FA();
            setSetup2FA({ qrCode: response.data.qrCode, secret: response.data.secret });
        } catch (error) {
            toast.error('Failed to setup 2FA');
        } finally {
            setLoading(false);
        }
    };

    const handleVerify2FA = async () => {
        if (verifyCode.length !== 6) {
            toast.error('Enter a 6-digit code');
            return;
        }
        setLoading(true);
        try {
            const response = await securityService.verifySetup2FA(verifyCode);
            setBackupCodes(response.data.backupCodes);
            setIs2FAEnabled(true);
            setSetup2FA(null);
            toast.success('2FA enabled!');
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Invalid code');
        } finally {
            setLoading(false);
        }
    };

    const handleDisable2FA = async () => {
        setLoading(true);
        try {
            await securityService.disable2FA(disableCode);
            setIs2FAEnabled(false);
            setDisableCode('');
            toast.success('2FA disabled');
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Invalid code');
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteSession = async (sessionId: string) => {
        try {
            await securityService.deleteSession(sessionId);
            setSessions(sessions.filter((s) => s.id !== sessionId));
            toast.success('Session terminated');
        } catch (error) {
            toast.error('Failed to terminate session');
        }
    };

    const handleLogoutAll = async () => {
        try {
            await securityService.deleteAllSessions();
            fetchSessions();
            toast.success('All other sessions terminated');
        } catch (error) {
            toast.error('Failed to logout');
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 py-12 px-4">
            <Toaster position="top-right" />
            <div className="max-w-4xl mx-auto">
                <h1 className="text-3xl font-bold text-white mb-8">Security Settings</h1>

                {/* Tabs */}
                <div className="flex space-x-4 mb-6">
                    <button onClick={() => setActiveTab('2fa')} className={`px-6 py-2 rounded-lg transition ${activeTab === '2fa' ? 'bg-purple-600 text-white' : 'bg-white/10 text-gray-300'}`}>
                        Two-Factor Auth
                    </button>
                    <button onClick={() => setActiveTab('sessions')} className={`px-6 py-2 rounded-lg transition ${activeTab === 'sessions' ? 'bg-purple-600 text-white' : 'bg-white/10 text-gray-300'}`}>
                        Active Sessions
                    </button>
                </div>

                <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
                    {/* 2FA Tab */}
                    {activeTab === '2fa' && (
                        <div className="space-y-6">
                            {backupCodes ? (
                                <div>
                                    <h2 className="text-xl font-semibold text-green-400 mb-4">✅ 2FA Enabled! Save Your Backup Codes</h2>
                                    <div className="grid grid-cols-2 gap-2 max-w-md">
                                        {backupCodes.map((code, i) => (
                                            <code key={i} className="bg-white/10 p-2 rounded text-center text-white font-mono">{code}</code>
                                        ))}
                                    </div>
                                    <button onClick={() => setBackupCodes(null)} className="mt-4 px-4 py-2 bg-purple-600 text-white rounded-lg">
                                        I've saved my codes
                                    </button>
                                </div>
                            ) : setup2FA ? (
                                <div className="space-y-4">
                                    <h2 className="text-xl font-semibold text-white">Scan QR Code</h2>
                                    <img src={setup2FA.qrCode} alt="2FA QR Code" className="mx-auto bg-white p-4 rounded" />
                                    <p className="text-gray-400 text-sm">Or enter manually: <code className="bg-white/10 px-2 py-1 rounded">{setup2FA.secret}</code></p>
                                    <input
                                        type="text"
                                        maxLength={6}
                                        placeholder="Enter 6-digit code"
                                        value={verifyCode}
                                        onChange={(e) => setVerifyCode(e.target.value.replace(/\D/g, ''))}
                                        className="w-full max-w-xs px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white text-center text-2xl tracking-widest"
                                    />
                                    <button onClick={handleVerify2FA} disabled={loading} className="px-6 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg disabled:opacity-50">
                                        {loading ? 'Verifying...' : 'Verify & Enable'}
                                    </button>
                                </div>
                            ) : is2FAEnabled ? (
                                <div>
                                    <h2 className="text-xl font-semibold text-green-400 mb-4">✅ 2FA is Enabled</h2>
                                    <input
                                        type="text"
                                        maxLength={6}
                                        placeholder="Enter code to disable"
                                        value={disableCode}
                                        onChange={(e) => setDisableCode(e.target.value)}
                                        className="w-full max-w-xs px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white mb-4"
                                    />
                                    <button onClick={handleDisable2FA} disabled={loading} className="px-6 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg disabled:opacity-50">
                                        Disable 2FA
                                    </button>
                                </div>
                            ) : (
                                <div>
                                    <h2 className="text-xl font-semibold text-white mb-4">Enable Two-Factor Authentication</h2>
                                    <p className="text-gray-400 mb-4">Add an extra layer of security to your account.</p>
                                    <button onClick={handleSetup2FA} disabled={loading} className="px-6 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg disabled:opacity-50">
                                        {loading ? 'Setting up...' : 'Setup 2FA'}
                                    </button>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Sessions Tab */}
                    {activeTab === 'sessions' && (
                        <div>
                            <div className="flex justify-between items-center mb-6">
                                <h2 className="text-xl font-semibold text-white">Active Sessions</h2>
                                <button onClick={handleLogoutAll} className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm">
                                    Logout All Other Devices
                                </button>
                            </div>
                            <div className="space-y-4">
                                {sessions.map((session) => (
                                    <div key={session.id} className={`flex items-center justify-between p-4 rounded-lg ${session.isCurrent ? 'bg-green-600/20 border border-green-500/50' : 'bg-white/5'}`}>
                                        <div>
                                            <p className="text-white font-medium">
                                                {session.browser} on {session.os}
                                                {session.isCurrent && <span className="ml-2 text-green-400 text-sm">(Current)</span>}
                                            </p>
                                            <p className="text-gray-400 text-sm">{session.device} • {session.ipAddress}</p>
                                            <p className="text-gray-500 text-xs">Last active: {new Date(session.lastActivity).toLocaleString()}</p>
                                        </div>
                                        {!session.isCurrent && (
                                            <button onClick={() => handleDeleteSession(session.id)} className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm">
                                                Logout
                                            </button>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default SecuritySettingsPage;
