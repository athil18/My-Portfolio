import React, { useEffect, useState } from 'react';
import { Elements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import apiClient from '../services/api';
import CheckoutForm from './CheckoutForm';

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || '');

interface StripePaymentWrapperProps {
    orderId: string;
    onSuccess: () => void;
}

const StripePaymentWrapper: React.FC<StripePaymentWrapperProps> = ({ orderId, onSuccess }) => {
    const [clientSecret, setClientSecret] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const createIntent = async () => {
            try {
                const response = await apiClient.post('/payments/create-intent', { orderId });
                setClientSecret(response.data.clientSecret);
            } catch (error) {
                console.error('Failed to create payment intent:', error);
            } finally {
                setLoading(false);
            }
        };

        createIntent();
    }, [orderId]);

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center p-12 space-y-4">
                <div className="animate-spin h-10 w-10 border-4 border-violet-500 border-t-transparent rounded-full"></div>
                <p className="text-gray-400">Initializing secure payment...</p>
            </div>
        );
    }

    if (!clientSecret) {
        return (
            <div className="bg-red-900/10 border border-red-500/20 p-6 rounded-xl text-center">
                <p className="text-red-400">Failed to initialize payment. Please try again or contact support.</p>
            </div>
        );
    }

    return (
        <Elements
            stripe={stripePromise}
            options={{
                clientSecret,
                appearance: {
                    theme: 'night',
                    variables: {
                        colorPrimary: '#8b5cf6',
                        colorBackground: '#111827',
                        colorText: '#f3f4f6',
                        colorDanger: '#ef4444',
                        fontFamily: 'Inter, sans-serif',
                        borderRadius: '12px',
                    },
                }
            }}
        >
            <CheckoutForm orderId={orderId} onSuccess={onSuccess} />
        </Elements>
    );
};

export default StripePaymentWrapper;
