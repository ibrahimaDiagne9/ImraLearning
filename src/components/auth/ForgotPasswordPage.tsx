import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, ArrowLeft, Loader2 } from 'lucide-react';
import { useToast } from '../../context/ToastContext';
import api from '../../services/api';

export const ForgotPasswordPage = () => {
    const [email, setEmail] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isSubmitted, setIsSubmitted] = useState(false);
    const { showToast } = useToast();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!email) {
            showToast('Please enter your email address.', 'error');
            return;
        }

        setIsLoading(true);
        try {
            await api.post('/auth/password-reset/', { email });
            setIsSubmitted(true);
            showToast('Password reset requested successfully.', 'success');
        } catch (error: any) {
            console.error('Password reset request error:', error);
            showToast(error.response?.data?.error || 'Failed to request reset. Please try again.', 'error');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#0A0F1C] flex items-center justify-center p-4">
            <div className="max-w-md w-full">
                <div className="bg-[#111827] border border-gray-800 rounded-3xl p-8 shadow-2xl">
                    <div className="text-center mb-8">
                        <h2 className="text-3xl font-black text-white mb-2">Reset Password</h2>
                        <p className="text-gray-400 text-sm">
                            {!isSubmitted
                                ? "Enter your email address and we'll send you a link to reset your password."
                                : "Check your email for the reset link!"}
                        </p>
                    </div>

                    {!isSubmitted ? (
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div>
                                <label className="block text-sm font-bold text-gray-400 mb-2">
                                    Email Address
                                </label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                        <Mail className="h-5 w-5 text-gray-500" />
                                    </div>
                                    <input
                                        type="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        className="block w-full pl-12 pr-4 py-3 bg-[#1F2937] border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                        placeholder="you@example.com"
                                        required
                                    />
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={isLoading}
                                className="w-full flex items-center justify-center py-3 px-4 rounded-xl text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {isLoading ? (
                                    <>
                                        <Loader2 className="w-5 h-5 animate-spin mr-2" />
                                        Sending Link...
                                    </>
                                ) : (
                                    'Send Reset Link'
                                )}
                            </button>
                        </form>
                    ) : (
                        <div className="space-y-6">
                            <button
                                onClick={() => { setIsSubmitted(false); setEmail(''); }}
                                className="w-full flex items-center justify-center py-3 px-4 rounded-xl text-sm font-bold text-gray-300 bg-gray-800 hover:bg-gray-700 transition-colors"
                            >
                                Try another email
                            </button>
                        </div>
                    )}

                    <div className="mt-8 text-center">
                        <Link
                            to="/login"
                            className="inline-flex items-center text-sm font-bold text-blue-500 hover:text-blue-400 transition-colors"
                        >
                            <ArrowLeft className="w-4 h-4 mr-2" />
                            Back to Sign In
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
};
