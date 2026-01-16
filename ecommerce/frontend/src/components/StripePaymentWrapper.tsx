import React, { useState } from 'react';
import apiClient from '../services/api';
import toast from 'react-hot-toast';

interface StripePaymentWrapperProps {
    orderId: string;
    onSuccess: (order: any) => void;
}

const StripePaymentWrapper: React.FC<StripePaymentWrapperProps> = ({ orderId, onSuccess }) => {
    const [loading, setLoading] = useState(false);

    const handlePayment = async () => {
        setLoading(true);
        try {
            const res = await apiClient.post(`/orders/${orderId}/pay`);

            toast.success('Payment successful! Redirecting...');
            onSuccess(res.data.data);
        } catch (error) {
            console.error('Payment failed', error);
            toast.error('Payment failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="text-center p-8 space-y-8">
            <div className="bg-purple-500/10 border border-purple-500/20 rounded-2xl p-6">
                <div className="w-16 h-16 bg-purple-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                    </svg>
                </div>
                <h3 className="text-xl font-bold text-white mb-2">Secure Payment</h3>
                <p className="text-slate-400">
                    Click below to complete your order securely.
                </p>
            </div>

            <button
                onClick={handlePayment}
                disabled={loading}
                className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-bold py-4 rounded-xl shadow-lg shadow-purple-900/20 transition-all transform active:scale-95 disabled:opacity-50 flex items-center justify-center gap-3 text-lg"
            >
                {loading ? (
                    <>
                        <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        Processing...
                    </>
                ) : (
                    <>
                        Pay Now
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                        </svg>
                    </>
                )}
            </button>

            <p className="text-xs text-slate-500 flex items-center justify-center gap-2">
                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
                256-bit SSL Encrypted Payment
            </p>
        </div>
    );
};

export default StripePaymentWrapper;
