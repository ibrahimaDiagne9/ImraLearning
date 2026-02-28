import { useEffect, useState, useRef } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { MailCheck, XCircle, ArrowRight, Loader2 } from 'lucide-react';
import api from '../../services/api';

export const VerifyEmailPage = () => {
    const [searchParams] = useSearchParams();
    const token = searchParams.get('token');
    const navigate = useNavigate();

    const [status, setStatus] = useState<'verifying' | 'success' | 'error'>('verifying');
    const [errorMessage, setErrorMessage] = useState('');
    const hasAttempted = useRef(false);

    useEffect(() => {
        if (!token) {
            setStatus('error');
            setErrorMessage('No verification token provided in the URL.');
            return;
        }

        const verifyEmail = async () => {
            if (hasAttempted.current) return;
            hasAttempted.current = true;

            try {
                await api.post('/auth/verify-email-confirm/', { token });
                setStatus('success');
            } catch (error: any) {
                console.error('Email verification error:', error);
                setStatus('error');
                setErrorMessage(error.response?.data?.error || 'Failed to verify email. The link might be expired or invalid.');
            }
        };

        verifyEmail();
    }, [token]);

    return (
        <div className="min-h-screen bg-[#0A0F1C] flex items-center justify-center p-4">
            <div className="max-w-md w-full">
                <div className="bg-[#111827] border border-gray-800 rounded-3xl p-8 shadow-2xl text-center">

                    {status === 'verifying' && (
                        <div className="space-y-6 flex flex-col items-center">
                            <Loader2 className="w-16 h-16 text-blue-500 animate-spin" />
                            <div>
                                <h2 className="text-2xl font-black text-white mb-2">Verifying Email...</h2>
                                <p className="text-gray-400 text-sm">Please wait while we confirm your email address.</p>
                            </div>
                        </div>
                    )}

                    {status === 'success' && (
                        <div className="space-y-6 flex flex-col items-center animate-in fade-in zoom-in duration-500">
                            <div className="w-20 h-20 rounded-full bg-green-500/20 flex items-center justify-center border border-green-500/50">
                                <MailCheck className="w-10 h-10 text-green-400" />
                            </div>
                            <div>
                                <h2 className="text-2xl font-black text-white mb-2">Email Verified!</h2>
                                <p className="text-gray-400 text-sm">Thank you for confirming your email. Your account is now fully active.</p>
                            </div>
                            <button
                                onClick={() => navigate('/dashboard')}
                                className="w-full flex items-center justify-center py-3 px-4 rounded-xl text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 transition-colors mt-4"
                            >
                                Continue to Dashboard
                                <ArrowRight className="w-4 h-4 ml-2" />
                            </button>
                        </div>
                    )}

                    {status === 'error' && (
                        <div className="space-y-6 flex flex-col items-center animate-in fade-in zoom-in duration-500">
                            <div className="w-20 h-20 rounded-full bg-red-500/20 flex items-center justify-center border border-red-500/50">
                                <XCircle className="w-10 h-10 text-red-500" />
                            </div>
                            <div>
                                <h2 className="text-2xl font-black text-white mb-2">Verification Failed</h2>
                                <p className="text-gray-400 text-sm">{errorMessage}</p>
                            </div>
                            <div className="w-full flex flex-col gap-3 mt-4">
                                <Link
                                    to="/login"
                                    className="w-full flex items-center justify-center py-3 px-4 rounded-xl text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 transition-colors"
                                >
                                    Go to Sign In
                                </Link>
                                <Link
                                    to="/dashboard"
                                    className="w-full flex items-center justify-center py-3 px-4 rounded-xl text-sm font-bold text-gray-300 bg-gray-800 hover:bg-gray-700 transition-colors"
                                >
                                    Skip for now
                                </Link>
                            </div>
                        </div>
                    )}

                </div>
            </div>
        </div>
    );
};
