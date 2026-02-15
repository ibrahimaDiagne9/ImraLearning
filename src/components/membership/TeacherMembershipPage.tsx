import { ArrowLeft, Check, Zap, Shield, TrendingUp, DollarSign } from 'lucide-react';

interface Plan {
    id: string;
    name: string;
    price: string;
    period: string;
    fee: string;
    description: string;
    features: string[];
    color: string;
    isPopular?: boolean;
}

const TEACHER_PLANS: Plan[] = [
    {
        id: 'free',
        name: 'Lite',
        price: '$0',
        period: '',
        fee: '15% Transaction Fee',
        description: 'Perfect for getting started with your first students.',
        features: [
            'Basic Analytics',
            'Up to 3 Courses',
            'Community Support',
            'Standard Video Hosting'
        ],
        color: 'border-gray-800'
    },
    {
        id: 'pro',
        name: 'Pro',
        price: '$49',
        period: '/mo',
        fee: '5% Transaction Fee',
        description: 'Scale your career with professional business tools.',
        features: [
            'Advanced Course Analytics',
            'Unlimited Courses',
            'Email Marketing Tools',
            'Priority Support',
            'Custom Certificates'
        ],
        color: 'border-blue-600',
        isPopular: true
    },
    {
        id: 'enterprise',
        name: 'Enterprise',
        price: '$149',
        period: '/mo',
        fee: '0% Transaction Fee',
        description: 'For established academies and global brands.',
        features: [
            '0% Transaction Fees',
            'Custom Domain Support',
            'Dedicated Account Manager',
            'White-label Experience',
            'Bulk Student Imports'
        ],
        color: 'border-purple-600'
    }
];

import { useAuth } from '../../context/AuthContext';

interface TeacherMembershipPageProps {
    onSelectPlan: (plan: Plan) => void;
    onBack: () => void;
}

export const TeacherMembershipPage = ({ onSelectPlan, onBack }: TeacherMembershipPageProps) => {
    const { tier } = useAuth();
    return (
        <div className="p-6 max-w-7xl mx-auto min-h-screen">
            <button
                onClick={onBack}
                className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors mb-12 group"
            >
                <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                Back to Dashboard
            </button>

            <div className="text-center mb-20">
                <div className="inline-flex items-center gap-2 bg-indigo-500/10 text-indigo-400 px-4 py-2 rounded-full text-sm font-bold mb-6 border border-indigo-500/20">
                    <TrendingUp className="w-4 h-4" />
                    Scale Your Teaching Business
                </div>
                <h1 className="text-5xl font-black text-white mb-6 tracking-tight">
                    Keep More of What You <span className="bg-gradient-to-r from-blue-400 to-indigo-500 bg-clip-text text-transparent">Earn</span>
                </h1>
                <p className="text-gray-400 text-lg max-w-2xl mx-auto font-medium">
                    Upgrade to a Teacher Pro plan and slash your transaction fees. Focus on teaching while we provide the tools to grow your brand.
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-24">
                {TEACHER_PLANS.map((plan) => (
                    <div
                        key={plan.id}
                        className={`relative group bg-[#0B0F1A] border ${plan.color} rounded-3xl p-8 transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl ${plan.isPopular ? 'shadow-blue-900/10 border-t-4' : ''}`}
                    >
                        {plan.isPopular && (
                            <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-blue-600 text-white text-[10px] font-black px-4 py-1.5 rounded-full tracking-widest uppercase shadow-lg shadow-blue-900/40">
                                Best Value
                            </div>
                        )}

                        <div className="mb-8">
                            <h3 className="text-2xl font-bold text-white mb-2">{plan.name}</h3>
                            <div className="flex items-baseline gap-1 mb-4">
                                <span className="text-4xl font-black text-white">{plan.price}</span>
                                <span className="text-gray-500 font-medium">{plan.period}</span>
                            </div>
                            <div className="inline-flex items-center gap-2 bg-emerald-500/10 text-emerald-400 px-3 py-1 rounded-lg text-xs font-bold border border-emerald-500/20">
                                <DollarSign className="w-3.5 h-3.5" />
                                {plan.fee}
                            </div>
                        </div>

                        <p className="text-gray-400 text-sm mb-8 font-medium h-12">
                            {plan.description}
                        </p>

                        <ul className="space-y-4 mb-10">
                            {plan.features.map((feature, i) => (
                                <li key={i} className="flex items-center gap-3 text-sm text-gray-300 font-medium">
                                    <div className={`p-0.5 rounded-full bg-blue-500/10 group-hover:bg-blue-500/20 transition-colors`}>
                                        <Check className="w-3.5 h-3.5 text-blue-500" />
                                    </div>
                                    {feature}
                                </li>
                            ))}
                        </ul>

                        <button
                            onClick={() => plan.id !== tier && onSelectPlan(plan)}
                            className={`w-full py-4 rounded-xl font-bold transition-all ${plan.id === tier
                                ? 'bg-[#1F2937] text-gray-500 cursor-not-allowed border border-gray-700'
                                : plan.isPopular
                                    ? 'bg-blue-600 text-white hover:bg-blue-700 shadow-lg shadow-blue-900/20'
                                    : 'bg-gray-800 text-white hover:bg-gray-700 border border-gray-700'
                                }`}
                        >
                            {plan.id === tier ? 'Current Plan' : `Upgrade to ${plan.name}`}
                        </button>
                    </div>
                ))}
            </div>

            {/* Benefit Highlights */}
            <div className="bg-[#111827] border border-gray-800 rounded-3xl p-12 overflow-hidden relative">
                <div className="absolute top-0 right-0 p-12 opacity-5 pointer-events-none">
                    <TrendingUp className="w-64 h-64 text-blue-500" />
                </div>

                <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
                    <div className="space-y-4">
                        <div className="w-12 h-12 bg-blue-600/20 rounded-2xl flex items-center justify-center">
                            <Zap className="w-6 h-6 text-blue-500" />
                        </div>
                        <h4 className="text-white font-bold text-lg">Instant Growth</h4>
                        <p className="text-gray-400 text-sm leading-relaxed">
                            Access powerful marketing tools that help you reach more students and fill your cohorts faster.
                        </p>
                    </div>
                    <div className="space-y-4">
                        <div className="w-12 h-12 bg-purple-600/20 rounded-2xl flex items-center justify-center">
                            <Shield className="w-6 h-6 text-purple-500" />
                        </div>
                        <h4 className="text-white font-bold text-lg">Verified Instructor</h4>
                        <p className="text-gray-400 text-sm leading-relaxed">
                            Pro instructors get a special verified badge on their profile, increasing course conversion rates by up to 40%.
                        </p>
                    </div>
                    <div className="space-y-4">
                        <div className="w-12 h-12 bg-emerald-600/20 rounded-2xl flex items-center justify-center">
                            <TrendingUp className="w-6 h-6 text-emerald-500" />
                        </div>
                        <h4 className="text-white font-bold text-lg">Deep Analytics</h4>
                        <p className="text-gray-400 text-sm leading-relaxed">
                            Understand exactly how your students are learning with granular completion rates and dropout heatmaps.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};
