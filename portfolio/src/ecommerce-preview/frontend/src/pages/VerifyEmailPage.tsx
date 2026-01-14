import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { authService } from '../services/authService';

const VerifyEmailPage: React.FC = () => {
    const { token } = useParams<{ token: string }>();
    const navigate = useNavigate();
    const [status, setStatus] = useState<'verifying' | 'success' | 'error'>('verifying');
    const [message, setMessage] = useState('');

    const verifyEmail = React.useCallback(async () => {
        try {
            const response = await authService.verifyEmail(token!);
            if (response.data.accessToken) {
                localStorage.setItem('accessToken', response.data.accessToken);
                localStorage.setItem('refreshToken', response.data.refreshToken);
            }
            setStatus('success');
            setMessage('Email verified successfully!');
            setTimeout(() => navigate('/dashboard'), 3000);
        } catch (error: unknown) {
            setStatus('error');
            const err = error as { response?: { data?: { message?: string } } };
            setMessage(err.response?.data?.message || 'Verification failed');
        }
    }, [token, navigate]);

    useEffect(() => {
        if (token) verifyEmail();
    }, [token, verifyEmail]);

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 px-4">
            <div className="max-w-md w-full bg-white/10 backdrop-blur-lg rounded-2xl p-8 shadow-2xl border border-white/20 text-center">
                {status === 'verifying' && (
                    <>
                        <div className="animate-spin rounded-full h-16 w-16 border-4 border-purple-500 border-t-transparent mx-auto mb-4"></div>
                        <h2 className="text-2xl font-bold text-white">Verifying your email...</h2>
                    </>
                )}
                {status === 'success' && (
                    <>
                        <svg className="mx-auto h-16 w-16 text-green-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <h2 className="text-2xl font-bold text-white mb-2">{message}</h2>
                        <p className="text-gray-300">Redirecting to dashboard...</p>
                    </>
                )}
                {status === 'error' && (
                    <>
                        <svg className="mx-auto h-16 w-16 text-red-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <h2 className="text-2xl font-bold text-white mb-2">{message}</h2>
                        <Link to="/login" className="text-purple-400 hover:underline">Back to login</Link>
                    </>
                )}
            </div>
        </div>
    );
};

export default VerifyEmailPage;
