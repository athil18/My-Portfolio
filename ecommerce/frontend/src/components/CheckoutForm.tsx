import React, { useState } from 'react';
import {
    PaymentElement,
    useStripe,
    useElements,
} from '@stripe/react-stripe-js';
import toast from 'react-hot-toast';

interface CheckoutFormProps {
    orderId: string;
    onSuccess: () => void;
}

const CheckoutForm: React.FC<CheckoutFormProps> = ({ orderId, onSuccess }) => {
    const stripe = useStripe();
    const elements = useElements();
    const [isProcessing, setIsProcessing] = useState(false);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!stripe || !elements) return;

        setIsProcessing(true);
        setErrorMessage(null);

        const { error, paymentIntent } = await stripe.confirmPayment({
            elements,
            confirmParams: {
                return_url: `${window.location.origin}/order-success?orderId=${orderId}`,
            },
            redirect: 'if_required', // Don't redirect if payment succeeds immediately
        });

        if (error) {
            setErrorMessage(error.message || 'An unexpected error occurred.');
            toast.error(error.message || 'Payment failed');
        } else if (paymentIntent && paymentIntent.status === 'succeeded') {
            toast.success('Payment successful!');
            onSuccess();
        }

        setIsProcessing(false);
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <div className="bg-[#0f0f13] p-6 rounded-xl border border-white/10 shadow-[inner_0_0_20px_rgba(0,0,0,0.5)]">
                <PaymentElement
                    options={{
                        layout: 'tabs',
                        // Note: Theme customization is handled in StripePaymentWrapper via appearance prop
                    }}
                />
            </div>

            {errorMessage && (
                <div className="text-red-400 text-sm bg-red-900/20 p-4 rounded-lg border border-red-500/30 flex items-center">
                    <span className="mr-2">⚠️</span> {errorMessage}
                </div>
            )}

            <button
                disabled={isProcessing || !stripe || !elements}
                className="cyber-btn w-full group"
            >
                <span className="flex items-center justify-center space-x-2">
                    {isProcessing ? (
                        <>
                            <svg className="animate-spin h-5 w-5 text-cyan-400" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            <span className="animate-pulse">PROCESSING TRANSFER...</span>
                        </>
                    ) : (
                        <>
                            <span>CONFIRM PAYMENT</span>
                            <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                            </svg>
                        </>
                    )}
                </span>
            </button>

            <p className="text-gray-500 text-[10px] text-center uppercase tracking-widest font-mono">
                SECURED BY STRIPE // 256-BIT ENCRYPTION
            </p>
        </form>
    );
};

export default CheckoutForm;
