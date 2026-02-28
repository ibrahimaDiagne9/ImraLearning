import React, { useState } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { Lock, Loader2 } from 'lucide-react';
import { useToast } from '../../context/ToastContext';
import api from '../../services/api';

export const ResetPasswordPage = () => {
    const [searchParams] = useSearchParams();
    const token = searchParams.get('token');
    const navigate = useNavigate();
    const { showToast } = useToast();

    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);

    if (!token) {
        return (
            <div className="min-h-screen bg-[#0A0F1C] flex flex-col items-center justify-center p-4">
                <div className="bg-[#111827] border border-red-500/20 rounded-3xl p-8 max-w-md w-full text-center">
                    <h2 className="text-xl font-bold text-red-400 mb-2">Invalid Reset Link</h2>
                    <p className="text-gray-400 text-sm mb-6">
                        This password reset link is invalid or has expired. Please request a new one.
                    </p>
                    <Link
                        to="/forgot-password"
                        className="inline-block bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-xl text-sm font-bold transition-colors"
                    >
                        Request New Link
                    </Link>
                </div>
            </div>
        );
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (password !== confirmPassword) {
            showToast('Passwords do not match.', 'error');
            return;
        }

        if (password.length < 8) {
            showToast('Password must be at least 8 characters long.', 'error');
            return;
        }

        setIsLoading(true);
        try {
            await api.post('/auth/password-reset-confirm/', { token, password });
            setIsSuccess(true);
            showToast('Password reset successful! You can now sign in.', 'success');
        } catch (error: any) {
            console.error('Password reset confirmation error:', error);
            showToast(error.response?.data?.error || 'Failed to reset password. The link might be expired.', 'error');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#0A0F1C] flex items-center justify-center p-4">
            <div className="max-w-md w-full">
                <div className="bg-[#111827] border border-gray-800 rounded-3xl p-8 shadow-2xl">
                    <div className="text-center mb-8">
                        <h2 className="text-3xl font-black text-white mb-2">Set New Password</h2>
                        <p className="text-gray-400 text-sm">
                            {!isSuccess
                                ? "Enter your new password below."
                                : "Your password has been changed successfully."}
                        </p>
                    </div>

                    {!isSuccess ? (
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div>
                                <label className="block text-sm font-bold text-gray-400 mb-2">
                                    New Password
                                </label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                        <Lock className="h-5 w-5 text-gray-500" />
                                    </div>
                                    <input
                                        type="password"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        className="block w-full pl-12 pr-4 py-3 bg-[#1F2937] border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                        placeholder="••••••••"
                                        required
                                        minLength={8}
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-gray-400 mb-2">
                                    Confirm New Password
                                </label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                        <Lock className="h-5 w-5 text-gray-500" />
                                    </div>
                                    <input
                                        type="password"
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        className="block w-full pl-12 pr-4 py-3 bg-[#1F2937] border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                        placeholder="••••••••"
                                        required
                                        minLength={8}
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
                                        Resetting...
                                    </>
                                ) : (
                                    'Reset Password'
                                )}
                            </button>
                        </form>
                    ) : (
                        <div className="text-center space-y-6">
                            <div className="mx-auto w-16 h-16 rounded-full bg-green-500/20 flex items-center justify-center border border-green-500/50">
                                <Lock className="w-8 h-8 text-green-400" />
                            </div>
                            <button
                                onClick={() => navigate('/login')}
                                className="w-full flex items-center justify-center py-3 px-4 rounded-xl text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 transition-colors"
                            >
                                Sign In Now
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
