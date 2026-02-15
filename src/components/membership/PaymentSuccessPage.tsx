import { CheckCircle, PartyPopper, ArrowRight, Star } from 'lucide-react';

interface PaymentSuccessPageProps {
    onFinish: () => void;
}

export const PaymentSuccessPage = ({ onFinish }: PaymentSuccessPageProps) => {
    return (
        <div className="p-6 flex flex-col items-center justify-center min-h-[80vh] text-center max-w-2xl mx-auto">
            <div className="relative mb-12">
                <div className="absolute -inset-4 bg-emerald-500/20 rounded-full blur-2xl animate-pulse"></div>
                <div className="relative w-24 h-24 bg-emerald-500 rounded-full flex items-center justify-center shadow-2xl shadow-emerald-900/40">
                    <CheckCircle className="w-12 h-12 text-white" />
                </div>
                <div className="absolute -top-2 -right-2 w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center animate-bounce shadow-xl">
                    <Star className="w-5 h-5 text-white fill-white" />
                </div>
            </div>

            <div className="space-y-6 mb-12">
                <div className="flex items-center justify-center gap-3 text-emerald-400 bg-emerald-500/10 px-4 py-1.5 rounded-full w-fit mx-auto mb-4">
                    <PartyPopper className="w-4 h-4" />
                    <span className="text-xs font-bold uppercase tracking-widest">Upgrade Successful</span>
                </div>
                <h1 className="text-5xl font-bold text-white tracking-tight">Welcome to Pro, Alex!</h1>
                <p className="text-gray-400 text-lg leading-relaxed">
                    You've successfully unlocked the full power of ImraLearning. Your journey to mastery officially starts now.
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full mb-12">
                <div className="bg-[#111827] border border-gray-800 rounded-2xl p-6 text-left hover:border-blue-500/30 transition-colors">
                    <h4 className="text-white font-bold mb-2">Access Courses</h4>
                    <p className="text-xs text-gray-500 leading-relaxed">All premium content is now available in your dashboard.</p>
                </div>
                <div className="bg-[#111827] border border-gray-800 rounded-2xl p-6 text-left hover:border-purple-500/30 transition-colors">
                    <h4 className="text-white font-bold mb-2">1-on-1 Help</h4>
                    <p className="text-xs text-gray-500 leading-relaxed">Book your first mentorship session in the "Support" tab.</p>
                </div>
            </div>

            <button
                onClick={onFinish}
                className="group relative flex items-center gap-3 bg-blue-600 px-12 py-5 rounded-2xl font-bold text-white shadow-2xl shadow-blue-900/40 hover:bg-blue-700 transition-all hover:scale-105 active:scale-95"
            >
                Start Learning Now
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>

            <p className="mt-8 text-xs text-gray-500 font-medium">A receipt has been sent to your email address.</p>
        </div>
    );
};
