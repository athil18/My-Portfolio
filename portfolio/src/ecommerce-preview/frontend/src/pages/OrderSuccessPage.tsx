import React from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { CheckCircleIcon } from '@heroicons/react/24/outline';

const OrderSuccessPage: React.FC = () => {
    const [searchParams] = useSearchParams();
    const sessionId = searchParams.get('session_id');

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center py-12 px-4 px-6 lg:px-8">
            <div className="max-w-md w-full space-y-8 bg-white/10 backdrop-blur-lg p-8 rounded-2xl border border-white/20 text-center">
                <div>
                    <CheckCircleIcon className="mx-auto h-16 w-16 text-green-400" />
                    <h2 className="mt-6 text-3xl font-extrabold text-white">Order Successful!</h2>
                    <p className="mt-2 text-sm text-gray-300">
                        Thank you for your purchase. Your order is being processed.
                    </p>
                    {sessionId && (
                        <p className="mt-4 text-xs text-gray-400 break-all">
                            Session ID: {sessionId}
                        </p>
                    )}
                </div>
                <div className="mt-8 space-y-4">
                    <Link
                        to="/dashboard"
                        className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 transition duration-150 ease-in-out"
                    >
                        Go to Dashboard
                    </Link>
                    <Link
                        to="/products"
                        className="w-full flex justify-center py-3 px-4 border border-white/20 rounded-lg shadow-sm text-sm font-medium text-white bg-white/5 hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 transition duration-150 ease-in-out"
                    >
                        Continue Shopping
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default OrderSuccessPage;
