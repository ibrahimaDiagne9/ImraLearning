import { ArrowLeft, CheckCircle2 } from 'lucide-react';
import { useState, useEffect } from 'react';
import { PaymentModal } from '../courses/PaymentModal';

interface Plan {
    id: string;
    name: string;
    price: string;
    description: string;
    features: string[];
}

interface CheckoutPageProps {
    plan: Plan;
    onBack: () => void;
    onSuccess: () => void;
}

export const CheckoutPage = ({ plan, onBack, onSuccess }: CheckoutPageProps) => {
    const [showPaymentModal, setShowPaymentModal] = useState(false);
    const [paymentStatus, setPaymentStatus] = useState<'idle' | 'processing' | 'success'>('idle');
    
    // Auto-open modal
    useEffect(() => {
        if (plan) {
            setShowPaymentModal(true);
        }
    }, [plan]);

    if (!plan) return null;

    if (paymentStatus === 'success') {
        return (
            <div className="p-6 max-w-5xl mx-auto min-h-screen flex items-center justify-center">
                <div className="text-center space-y-6">
                    <div className="w-24 h-24 bg-green-500/10 rounded-full flex items-center justify-center mx-auto mb-8 relative">
                        <CheckCircle2 className="w-12 h-12 text-green-500 relative z-10" />
                    </div>
                    <h1 className="text-4xl font-bold text-white tracking-tight">Welcome to {plan.name}!</h1>
                    <p className="text-gray-400 max-w-sm mx-auto">
                        Your membership has been successfully upgraded. You now have access to all {plan.name} features.
                    </p>
                    <button
                        onClick={onSuccess}
                        className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-8 rounded-xl transition-all"
                    >
                        Go to Dashboard
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="p-6 max-w-5xl mx-auto min-h-screen">
            <button
                onClick={onBack}
                className="flex items-center gap-2 text-gray-400 hover:text-white mb-8 transition-colors text-sm font-medium"
            >
                <ArrowLeft className="w-4 h-4" />
                Change Selection
            </button>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                {/* Checkout Info */}
                <div className="space-y-8">
                    <div>
                        <h1 className="text-3xl font-bold text-white mb-2">Secure Checkout</h1>
                        <p className="text-gray-400">Complete your upgrade to {plan.name}</p>
                    </div>

                    <div className="bg-[#111827] border border-gray-800 rounded-2xl p-6 lg:p-8 space-y-6 flex flex-col items-center justify-center min-h-[300px]">
                       <p className="text-gray-300 text-center mb-6">Select your preferred payment method to complete the transaction safely.</p>
                       <button
                           onClick={() => setShowPaymentModal(true)}
                           className="py-4 px-8 rounded-xl font-bold bg-blue-600 text-white transition-all shadow-lg shadow-blue-900/20 hover:bg-blue-700"
                        >
                           Pay with Wave / Mobile Money / Card
                       </button>
                    </div>
                </div>

                {/* Order Summary */}
                <div className="lg:sticky lg:top-8 h-fit">
                    <div className="bg-[#111827] border border-gray-800 rounded-2xl p-8 space-y-8">
                        <h3 className="text-xl font-bold text-white">Order Summary</h3>

                        <div className="space-y-4">
                            <div className="pb-4 border-b border-gray-800">
                                <div className="flex justify-between mb-2">
                                    <span className="text-gray-300 font-medium">{plan.name} Membership</span>
                                    <span className="text-white font-bold">{plan.price}</span>
                                </div>
                                <p className="text-xs text-gray-500">{plan.description}</p>
                            </div>

                            <div className="space-y-3 pt-2">
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-400">Subtotal</span>
                                    <span className="text-gray-300">{plan.price}</span>
                                </div>
                                <div className="flex justify-between text-sm font-bold text-white text-lg">
                                    <span>Total Today</span>
                                    <span>{plan.price}</span>
                                </div>
                            </div>
                        </div>

                        <div className="pt-8 space-y-4">
                            <p className="text-xs text-gray-500 font-bold uppercase tracking-wider mb-4">Included in your plan:</p>
                            {plan.features.map((feature: string, i: number) => (
                                <div key={i} className="flex items-center gap-3 text-xs text-gray-400">
                                    <div className="w-1 h-1 rounded-full bg-blue-500" />
                                    {feature}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Use the exact same standard PaymentModal that Courses use! */}
            {showPaymentModal && (
                <PaymentModal
                    isOpen={showPaymentModal}
                    onClose={() => setShowPaymentModal(false)}
                    courseTitle={`${plan.name} Membership`}
                    amount={plan.price}
                    isMembership={true}
                    planId={plan.id}
                    onMembershipSuccess={() => {
                        setPaymentStatus('success');
                        setShowPaymentModal(false);
                    }}
                />
            )}
        </div>
    );
};
