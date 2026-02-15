import React, { useState } from 'react';
import { X, Smartphone, CreditCard, Wallet, Loader2, Sparkles } from 'lucide-react';

interface PaymentModalProps {
    isOpen: boolean;
    onClose: () => void;
    courseTitle: string;
    amount: number | string;
    onConfirm: (method: string, phoneNumber?: string) => Promise<void>;
    status?: 'idle' | 'processing' | 'success';
    statusMessage?: string;
}

export const PaymentModal: React.FC<PaymentModalProps> = ({
    isOpen,
    onClose,
    courseTitle,
    amount,
    onConfirm,
    status = 'idle',
    statusMessage
}) => {
    const [selectedMethod, setSelectedMethod] = useState<'wave' | 'card' | 'orange'>('wave');
    const [phoneNumber, setPhoneNumber] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    if (!isOpen) return null;

    if (status === 'success') {
        return (
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-300">
                <div className="relative w-full max-w-lg bg-[#0F172A] border border-white/10 rounded-[2.5rem] shadow-2xl p-12 text-center space-y-8 animate-in zoom-in-95 duration-300">
                    <div className="w-24 h-24 bg-green-500/10 rounded-full flex items-center justify-center mx-auto border border-green-500/20">
                        <Sparkles className="w-12 h-12 text-green-500 animate-pulse" />
                    </div>
                    <div className="space-y-2">
                        <h2 className="text-3xl font-black text-white">Payment Successful!</h2>
                        <p className="text-gray-400 font-medium">{statusMessage || 'Your enrollment is confirmed. Enjoy your learning journey!'}</p>
                    </div>
                    <button
                        onClick={onClose}
                        className="w-full py-5 rounded-2xl bg-green-600 hover:bg-green-700 text-white font-black uppercase tracking-widest transition-all"
                    >
                        Start Learning Now
                    </button>
                </div>
            </div>
        );
    }

    const handlePay = async () => {
        setIsSubmitting(true);
        try {
            await onConfirm(selectedMethod, phoneNumber);
        } catch (error) {
            console.error(error);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-300">
            <div className="relative w-full max-w-lg bg-[#0F172A] border border-white/10 rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
                {/* Header */}
                <div className="p-8 pb-4 flex justify-between items-start">
                    <div>
                        <h2 className="text-2xl font-bold text-white tracking-tight">Complete Payment</h2>
                        <p className="text-gray-400 mt-1 font-medium">{courseTitle}</p>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 rounded-2xl bg-white/5 hover:bg-white/10 text-gray-400 transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {status === 'processing' ? (
                    <div className="p-12 text-center space-y-8 min-h-[400px] flex flex-col justify-center">
                        <div className="relative w-20 h-20 mx-auto">
                            <div className="absolute inset-0 border-4 border-blue-500/20 border-t-blue-500 rounded-full animate-spin" />
                            <Smartphone className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 text-blue-400 animate-pulse" />
                        </div>
                        <div className="space-y-3">
                            <h3 className="text-xl font-bold text-white">Waiting for confirmation</h3>
                            <p className="text-gray-400 text-sm leading-relaxed px-8">
                                {statusMessage || "Please confirm the transaction on your phone. We'll automatically update once processed."}
                            </p>
                        </div>
                    </div>
                ) : (
                    <>
                        <div className="px-8 flex justify-between items-center py-6 border-y border-white/5 bg-white/[0.02]">
                            <span className="text-gray-400 font-medium">Amount to pay</span>
                            <span className="text-3xl font-black text-blue-500">${amount}</span>
                        </div>

                        <div className="p-8 space-y-8">
                            {/* Method Selection */}
                            <div className="space-y-4">
                                <h3 className="text-sm font-bold text-gray-300 uppercase tracking-widest">Select Payment Method</h3>
                                <div className="grid grid-cols-3 gap-4">
                                    {[
                                        { id: 'wave', label: 'Wave', icon: Smartphone },
                                        { id: 'card', label: 'Card', icon: CreditCard },
                                        { id: 'orange', label: 'Orange Money', icon: Wallet }
                                    ].map((method) => (
                                        <button
                                            key={method.id}
                                            onClick={() => setSelectedMethod(method.id as any)}
                                            className={`flex flex-col items-center gap-4 p-6 rounded-[2rem] border-2 transition-all duration-300 ${selectedMethod === method.id
                                                ? 'bg-blue-600/10 border-blue-500 text-blue-400 shadow-[0_0_30px_rgba(59,130,246,0.1)]'
                                                : 'bg-white/[0.03] border-white/5 text-gray-400 hover:bg-white/[0.05]'
                                                }`}
                                        >
                                            <method.icon className={`w-8 h-8 ${selectedMethod === method.id ? 'animate-pulse' : ''}`} />
                                            <span className="text-xs font-bold whitespace-nowrap">{method.label}</span>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Form Section */}
                            {(selectedMethod === 'wave' || selectedMethod === 'orange') && (
                                <div className="p-8 rounded-[2rem] bg-white/[0.03] border border-white/5 space-y-6">
                                    <h4 className="text-white font-bold capitalize">{selectedMethod === 'wave' ? 'Wave' : 'Orange Money'} Payment</h4>
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">
                                            {selectedMethod === 'wave' ? 'Wave' : 'Orange Money'} Phone Number
                                        </label>
                                        <div className="relative group">
                                            <input
                                                type="text"
                                                value={phoneNumber}
                                                onChange={(e) => setPhoneNumber(e.target.value)}
                                                placeholder="+221 77 123 45 67"
                                                className="w-full bg-black/40 border border-white/10 rounded-2xl p-5 text-white placeholder-gray-600 focus:outline-none focus:border-blue-500/50 transition-all font-medium"
                                            />
                                            <div className="absolute inset-0 rounded-2xl bg-blue-500/5 opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity"></div>
                                        </div>
                                        <p className="text-[11px] text-gray-500 mt-2 leading-relaxed">
                                            You will receive a push notification on your {selectedMethod === 'wave' ? 'Wave' : 'Orange Money'} app to confirm the payment.
                                        </p>
                                    </div>
                                </div>
                            )}

                            {selectedMethod === 'card' && (
                                <div className="p-8 rounded-[2rem] bg-white/[0.03] border border-white/5 text-center">
                                    <p className="text-sm text-gray-400">You will be securely redirected to complete your card payment.</p>
                                </div>
                            )}
                        </div>
                        {/* Footer Buttons */}
                        <div className="p-8 pt-0 flex gap-4">
                            <button
                                onClick={onClose}
                                className="flex-1 py-5 rounded-2xl bg-white/5 hover:bg-white/10 text-white font-bold transition-all"
                            >
                                Cancel
                            </button>
                            <button
                                disabled={isSubmitting || ((selectedMethod === 'wave' || selectedMethod === 'orange') && !phoneNumber)}
                                onClick={handlePay}
                                className="flex-[2] py-5 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-black uppercase tracking-widest shadow-xl shadow-blue-600/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-3"
                            >
                                {isSubmitting ? (
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                ) : (
                                    `Pay $${amount}`
                                )}
                            </button>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};
