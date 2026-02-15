import { ArrowLeft, CreditCard, Lock, ShieldCheck, Info } from 'lucide-react';
import { useState } from 'react';
import { upgradeMembership } from '../../services/api';

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
    const [formData, setFormData] = useState({
        cardName: '',
        cardNumber: '',
        expiry: '',
        cvc: ''
    });
    const [errors, setErrors] = useState<{ [key: string]: string }>({});
    const [isLoading, setIsLoading] = useState(false);

    const validate = () => {
        const newErrors: { [key: string]: string } = {};
        if (!formData.cardName.trim()) newErrors.cardName = 'Name is required';
        if (!/^\d{16}$/.test(formData.cardNumber.replace(/\s/g, ''))) newErrors.cardNumber = 'Invalid card number (16 digits)';
        if (!/^\d{2}\/\d{2}$/.test(formData.expiry)) newErrors.expiry = 'Invalid expiry (MM/YY)';
        if (!/^\d{3,4}$/.test(formData.cvc)) newErrors.cvc = 'Invalid CVC';

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validate()) return;

        setIsLoading(true);
        try {
            // Simulate payment processing delay for UX
            await new Promise(resolve => setTimeout(resolve, 1500));

            // Call backend to upgrade membership
            await upgradeMembership(plan.id);
            onSuccess();
        } catch (error) {
            console.error('Upgrade failed', error);
            alert('Payment failed. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        let formattedValue = value;

        if (name === 'cardNumber') {
            formattedValue = value.replace(/\D/g, '').substring(0, 16);
        } else if (name === 'expiry') {
            formattedValue = value.replace(/\D/g, '').substring(0, 4);
            if (formattedValue.length >= 3) {
                formattedValue = formattedValue.substring(0, 2) + '/' + formattedValue.substring(2);
            }
        } else if (name === 'cvc') {
            formattedValue = value.replace(/\D/g, '').substring(0, 4);
        }

        setFormData(prev => ({ ...prev, [name]: formattedValue }));
        if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
    };

    if (!plan) return null;

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
                {/* Payment Form */}
                <div className="space-y-8">
                    <div>
                        <h1 className="text-3xl font-bold text-white mb-2">Secure Checkout</h1>
                        <p className="text-gray-400">Complete your upgrade to {plan.name}</p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="bg-[#111827] border border-gray-800 rounded-2xl p-6 lg:p-8 space-y-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-400 mb-2">Cardholder Name</label>
                                <input
                                    type="text"
                                    name="cardName"
                                    value={formData.cardName}
                                    onChange={handleChange}
                                    placeholder="Full Name"
                                    className={`w-full bg-[#1F2937] border ${errors.cardName ? 'border-red-500' : 'border-gray-700'} rounded-lg px-4 py-3 text-white focus:outline-none focus:border-blue-500 transition-colors`}
                                />
                                {errors.cardName && <p className="text-red-500 text-xs mt-1">{errors.cardName}</p>}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-400 mb-2">Card Information</label>
                                <div className="relative">
                                    <input
                                        type="text"
                                        name="cardNumber"
                                        value={formData.cardNumber}
                                        onChange={handleChange}
                                        placeholder="0000 0000 0000 0000"
                                        className={`w-full bg-[#1F2937] border ${errors.cardNumber ? 'border-red-500' : 'border-gray-700'} rounded-lg pl-12 pr-4 py-3 text-white focus:outline-none focus:border-blue-500 transition-colors`}
                                    />
                                    <CreditCard className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                                </div>
                                {errors.cardNumber && <p className="text-red-500 text-xs mt-1">{errors.cardNumber}</p>}
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-400 mb-2">Expiry Date</label>
                                    <input
                                        type="text"
                                        name="expiry"
                                        value={formData.expiry}
                                        onChange={handleChange}
                                        placeholder="MM/YY"
                                        className={`w-full bg-[#1F2937] border ${errors.expiry ? 'border-red-500' : 'border-gray-700'} rounded-lg px-4 py-3 text-white focus:outline-none focus:border-blue-500 transition-colors`}
                                    />
                                    {errors.expiry && <p className="text-red-500 text-xs mt-1">{errors.expiry}</p>}
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-400 mb-2">CVC</label>
                                    <input
                                        type="text"
                                        name="cvc"
                                        value={formData.cvc}
                                        onChange={handleChange}
                                        placeholder="•••"
                                        className={`w-full bg-[#1F2937] border ${errors.cvc ? 'border-red-500' : 'border-gray-700'} rounded-lg px-4 py-3 text-white focus:outline-none focus:border-blue-500 transition-colors`}
                                    />
                                    {errors.cvc && <p className="text-red-500 text-xs mt-1">{errors.cvc}</p>}
                                </div>
                            </div>
                        </div>

                        <div className="flex items-start gap-3 bg-blue-500/5 border border-blue-500/10 rounded-xl p-4">
                            <Info className="w-5 h-5 text-blue-400 shrink-0" />
                            <p className="text-xs text-blue-200/60 leading-relaxed">
                                You will be charged {plan.price} today. Your subscription will renew automatically unless cancelled.
                            </p>
                        </div>

                        <button
                            type="submit"
                            disabled={isLoading}
                            className={`w-full py-4 rounded-xl font-bold bg-blue-600 text-white transition-all shadow-lg shadow-blue-900/20 flex items-center justify-center gap-3 ${isLoading ? 'opacity-70 cursor-wait' : 'hover:bg-blue-700'}`}
                        >
                            {isLoading ? (
                                <>
                                    <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                                    Processing...
                                </>
                            ) : (
                                <>
                                    <Lock className="w-5 h-5" />
                                    Complete Purchase
                                </>
                            )}
                        </button>

                        <div className="flex items-center justify-center gap-6 text-gray-500">
                            <div className="flex items-center gap-1.5 grayscale opacity-50">
                                <ShieldCheck className="w-4 h-4" />
                                <span className="text-[10px] font-bold uppercase tracking-widest">SSL Secure</span>
                            </div>
                            <div className="flex items-center gap-1.5 grayscale opacity-50">
                                <CreditCard className="w-4 h-4" />
                                <span className="text-[10px] font-bold uppercase tracking-widest">Encrypted</span>
                            </div>
                        </div>
                    </form>
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
        </div>
    );
};
