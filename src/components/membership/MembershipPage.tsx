import { Check, Star, Zap, Shield, ArrowLeft } from 'lucide-react';

interface Plan {
    id: string;
    name: string;
    price: string;
    period: string;
    description: string;
    features: string[];
    isPopular?: boolean;
    color: string;
}

const PLANS: Plan[] = [
    {
        id: 'free',
        name: 'Free',
        price: '$0',
        period: '/month',
        description: 'Perfect for exploring the platform',
        features: ['Access to 5 free courses', 'Community forum access', 'Public profile', 'Standard support'],
        color: 'border-gray-800'
    },
    {
        id: 'pro',
        name: 'Pro',
        price: '$29',
        period: '/month',
        description: 'The best value for serious learners',
        isPopular: true,
        features: ['Unlimited course access', '1-on-1 mentorship', 'Certificate of completion', 'Priority support', 'Exclusive webinars'],
        color: 'border-blue-500'
    },
    {
        id: 'enterprise',
        name: 'Enterprise',
        price: '$99',
        period: '/month',
        description: 'Advanced features for teams',
        features: ['Everything in Pro', 'Custom learning paths', 'Team management', 'API access', 'Dedicated account manager'],
        color: 'border-purple-500'
    }
];

import { useAuth } from '../../context/AuthContext';

interface MembershipPageProps {
    onSelectPlan: (plan: Plan) => void;
    onBack: () => void;
}

export const MembershipPage = ({ onSelectPlan, onBack }: MembershipPageProps) => {
    const { tier } = useAuth();
    return (
        <div className="p-6 max-w-7xl mx-auto min-h-screen">
            <button
                onClick={onBack}
                className="flex items-center gap-2 text-gray-400 hover:text-white mb-12 transition-colors text-sm font-medium"
            >
                <ArrowLeft className="w-4 h-4" />
                Back to Dashboard
            </button>

            <div className="text-center mb-16">
                <h1 className="text-4xl md:text-5xl font-bold text-white mb-6">Choose Your Journey</h1>
                <p className="text-gray-400 max-w-2xl mx-auto text-lg">
                    Unlock exclusive features and expert-led content by choosing a plan that fits your learning goals.
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {PLANS.map((plan) => (
                    <div
                        key={plan.id}
                        className={`relative group bg-[#111827] border ${plan.color} rounded-3xl p-8 transition-all duration-300 hover:scale-105 hover:shadow-2xl ${plan.isPopular ? 'shadow-blue-900/10' : ''}`}
                    >
                        {plan.isPopular && (
                            <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-blue-600 px-4 py-1 rounded-full text-xs font-bold text-white uppercase tracking-widest shadow-lg shadow-blue-900/50">
                                Most Popular
                            </div>
                        )}

                        <div className="mb-8">
                            <h3 className="text-2xl font-bold text-white mb-2">{plan.name}</h3>
                            <p className="text-gray-400 text-sm">{plan.description}</p>
                        </div>

                        <div className="flex items-baseline gap-1 mb-8">
                            <span className="text-4xl font-bold text-white">{plan.price}</span>
                            <span className="text-gray-500 font-medium">{plan.period}</span>
                        </div>

                        <ul className="space-y-4 mb-10">
                            {plan.features.map((feature, i) => (
                                <li key={i} className="flex items-center gap-3 text-sm text-gray-300">
                                    <div className="flex-shrink-0 w-5 h-5 rounded-full bg-blue-600/10 flex items-center justify-center">
                                        <Check className="w-3 h-3 text-blue-400" />
                                    </div>
                                    {feature}
                                </li>
                            ))}
                        </ul>

                        <button
                            onClick={() => plan.id !== tier && onSelectPlan(plan)}
                            className={`w-full py-4 rounded-xl font-bold transition-all ${plan.id === tier
                                ? 'bg-[#1F2937] text-gray-400 cursor-not-allowed border border-gray-700'
                                : plan.isPopular
                                    ? 'bg-blue-600 text-white hover:bg-blue-700 shadow-lg shadow-blue-900/20'
                                    : 'bg-[#1F2937] text-white hover:bg-gray-800 border border-gray-700'
                                }`}
                        >
                            {plan.id === tier ? 'Current Plan' : `Get ${plan.name}`}
                        </button>
                    </div>
                ))}
            </div>

            <div className="mt-24 grid grid-cols-1 md:grid-cols-3 gap-12 text-center max-w-5xl mx-auto pb-12">
                <div className="space-y-4">
                    <div className="w-12 h-12 bg-blue-600/10 rounded-2xl flex items-center justify-center mx-auto mb-6">
                        <Zap className="w-6 h-6 text-blue-400" />
                    </div>
                    <h4 className="text-lg font-bold text-white">Instant Access</h4>
                    <p className="text-sm text-gray-500 leading-relaxed">Start learning the moment your upgrade is complete. No delays.</p>
                </div>
                <div className="space-y-4">
                    <div className="w-12 h-12 bg-purple-600/10 rounded-2xl flex items-center justify-center mx-auto mb-6">
                        <Shield className="w-6 h-6 text-purple-400" />
                    </div>
                    <h4 className="text-lg font-bold text-white">Secure Billing</h4>
                    <p className="text-sm text-gray-500 leading-relaxed">Your payment information is encrypted and processed securely.</p>
                </div>
                <div className="space-y-4">
                    <div className="w-12 h-12 bg-pink-600/10 rounded-2xl flex items-center justify-center mx-auto mb-6">
                        <Star className="w-6 h-6 text-pink-400" />
                    </div>
                    <h4 className="text-lg font-bold text-white">Top Instructors</h4>
                    <p className="text-sm text-gray-500 leading-relaxed">Learn from the best in the industry with exclusive Pro content.</p>
                </div>
            </div>
        </div>
    );
};
