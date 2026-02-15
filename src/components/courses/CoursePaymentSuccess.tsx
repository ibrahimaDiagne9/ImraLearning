import { useState, useEffect } from 'react';
import { CheckCircle, PartyPopper, ArrowRight, BookOpen, Loader2 } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../../services/api';

export const CoursePaymentSuccess = () => {
    const { orderId } = useParams();
    const navigate = useNavigate();
    const [order, setOrder] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const verifyAndFetch = async () => {
            try {
                // Get token from URL search params (e.g., ?token=test_...)
                const searchParams = new URLSearchParams(window.location.search);
                const token = searchParams.get('token');

                if (token) {
                    console.log('Verifying PayDunya token...', token);
                    await api.post('/payments/paydunya/ipn/', { token });
                }

                // Fetch order details to show which course was purchased
                const response = await api.get('/orders/');
                const orders = response.data;
                const foundOrder = orders.find((o: any) => o.id.toString() === orderId);
                setOrder(foundOrder);
            } catch (error) {
                console.error('Failed to verify or fetch order details', error);
            } finally {
                setIsLoading(false);
            }
        };

        if (orderId) {
            verifyAndFetch();
        }
    }, [orderId]);

    if (isLoading) {
        return (
            <div className="min-h-[80vh] flex items-center justify-center">
                <Loader2 className="w-12 h-12 text-blue-500 animate-spin" />
            </div>
        );
    }

    return (
        <div className="p-6 flex flex-col items-center justify-center min-h-[80vh] text-center max-w-2xl mx-auto">
            <div className="relative mb-12">
                <div className="absolute -inset-4 bg-emerald-500/20 rounded-full blur-2xl animate-pulse"></div>
                <div className="relative w-24 h-24 bg-emerald-500 rounded-full flex items-center justify-center shadow-2xl shadow-emerald-900/40">
                    <CheckCircle className="w-12 h-12 text-white" />
                </div>
            </div>

            <div className="space-y-6 mb-12">
                <div className="flex items-center justify-center gap-3 text-emerald-400 bg-emerald-500/10 px-4 py-1.5 rounded-full w-fit mx-auto mb-4">
                    <PartyPopper className="w-4 h-4" />
                    <span className="text-xs font-bold uppercase tracking-widest">Payment Successful</span>
                </div>
                <h1 className="text-4xl md:text-5xl font-bold text-white tracking-tight">You're All Set!</h1>
                <p className="text-gray-400 text-lg leading-relaxed">
                    Thank you for your purchase. Your enrollment in <span className="text-blue-400 font-bold">"{order?.course_title || 'the course'}"</span> is now active.
                </p>
            </div>

            <div className="bg-[#111827] border border-gray-800 rounded-3xl p-8 w-full mb-12 relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
                    <BookOpen className="w-32 h-32 text-blue-500" />
                </div>
                <div className="relative z-10 text-left">
                    <h4 className="text-gray-500 text-xs font-bold uppercase tracking-widest mb-4">Order Summary</h4>
                    <div className="flex justify-between items-center py-4 border-b border-gray-800">
                        <span className="text-gray-400">Order ID</span>
                        <span className="text-white font-mono">#{orderId}</span>
                    </div>
                    <div className="flex justify-between items-center py-4 border-b border-gray-800">
                        <span className="text-gray-400">Course</span>
                        <span className="text-white font-bold">{order?.course_title}</span>
                    </div>
                    <div className="flex justify-between items-center py-4">
                        <span className="text-gray-400">Status</span>
                        <span className="text-emerald-500 font-bold uppercase text-xs">Completed</span>
                    </div>
                </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 w-full">
                <button
                    onClick={() => navigate(`/learn/${order?.course}`)}
                    className="flex-1 group relative flex items-center justify-center gap-3 bg-blue-600 px-8 py-4 rounded-2xl font-bold text-white shadow-2xl shadow-blue-900/40 hover:bg-blue-700 transition-all hover:scale-[1.02] active:scale-95"
                >
                    Start Learning
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </button>
                <button
                    onClick={() => navigate('/dashboard')}
                    className="flex-1 px-8 py-4 rounded-2xl font-bold text-gray-300 bg-[#111827] border border-gray-800 hover:bg-gray-800 transition-all"
                >
                    Go to Dashboard
                </button>
            </div>

            <p className="mt-8 text-xs text-gray-500 font-medium">A confirmation email has been sent to your registered address.</p>
        </div>
    );
};
