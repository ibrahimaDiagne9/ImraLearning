import { useState } from 'react';
import { MessageSquare, Zap, Eye, EyeOff, Loader2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';

interface SignupPageProps {
    onLogin: () => void;
}

export const SignupPage = ({ onLogin }: SignupPageProps) => {
    const { register } = useAuth();
    const navigate = useNavigate();
    const [role, setRole] = useState<'student' | 'teacher'>('student');
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (password !== confirmPassword) {
            setError('Passwords do not match');
            return;
        }
        setIsLoading(true);
        setError(null);
        try {
            await register({ username, email, password, role });
            navigate('/');
        } catch (err: unknown) {
            console.error(err);
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const data = (err as any).response?.data;
            if (data) {
                const message = Object.values(data).flat().join(' ');
                setError(message);
            } else {
                setError('Registration failed. Please try again.');
            }
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#0B1120] flex items-center justify-center p-4">
            <div className="flex w-full max-w-5xl bg-[#111827]/50 rounded-3xl overflow-hidden border border-gray-800 shadow-2xl backdrop-blur-sm min-h-[700px]">

                {/* Left Side - Branding & Social Proof */}
                <div className="hidden lg:flex w-1/2 bg-[#0F1623] p-12 flex-col justify-between relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
                    <div className="absolute bottom-0 left-0 w-96 h-96 bg-indigo-600/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2"></div>

                    <div>
                        <div className="flex items-center gap-3 mb-2">
                            <div className="bg-blue-600 p-2.5 rounded-xl">
                                <MessageSquare className="w-6 h-6 text-white" />
                            </div>
                            <h1 className="text-2xl font-bold text-white">EduPlatform</h1>
                        </div>
                        <p className="text-gray-400 pl-14">Start Your Learning Journey</p>
                    </div>

                    <div className="space-y-6 relative z-10">
                        <div className="bg-gradient-to-br from-[#1F2937] to-[#111827] p-6 rounded-2xl border border-gray-800 shadow-xl">
                            <div className="flex items-center gap-4 mb-4">
                                <div className="bg-blue-600 w-10 h-10 rounded-lg flex items-center justify-center shadow-lg shadow-blue-900/20">
                                    <Zap className="w-5 h-5 text-white" />
                                </div>
                                <h3 className="text-lg font-bold text-white">Join 1,284+ Learners</h3>
                            </div>
                            <p className="text-gray-400 text-sm leading-relaxed">
                                Be part of a thriving community where students and teachers collaborate, share knowledge, and grow together.
                            </p>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="bg-[#1F2937]/50 p-4 rounded-xl border border-gray-800 text-center">
                                <h4 className="text-2xl font-bold text-white mb-1">100+</h4>
                                <p className="text-xs text-gray-400 uppercase tracking-wider">Active Courses</p>
                            </div>
                            <div className="bg-[#1F2937]/50 p-4 rounded-xl border border-gray-800 text-center">
                                <h4 className="text-2xl font-bold text-white mb-1">50K+</h4>
                                <p className="text-xs text-gray-400 uppercase tracking-wider">Discussions</p>
                            </div>
                        </div>

                        <div className="bg-[#1F2937]/30 p-4 rounded-xl border border-gray-800/50 flex items-center gap-4">
                            <div className="flex -space-x-2">
                                <div className="w-8 h-8 rounded-full bg-blue-500 border-2 border-[#0F1623]"></div>
                                <div className="w-8 h-8 rounded-full bg-purple-500 border-2 border-[#0F1623]"></div>
                                <div className="w-8 h-8 rounded-full bg-orange-500 border-2 border-[#0F1623]"></div>
                                <div className="w-8 h-8 rounded-full bg-green-500 border-2 border-[#0F1623]"></div>
                            </div>
                            <div>
                                <p className="text-sm font-bold text-white">Trusted by educators worldwide</p>
                                <p className="text-xs text-gray-500">Rated 4.9/5 by our community</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Side - Signup Form */}
                <div className="w-full lg:w-1/2 p-8 md:p-12 flex flex-col justify-center bg-[#111827]">
                    <div className="mb-6 text-center">
                        <h2 className="text-3xl font-bold text-white mb-2">Create Account</h2>
                        <p className="text-gray-400">Join our learning community today</p>
                    </div>

                    {error && (
                        <div className="mb-6 p-4 bg-red-500/10 border border-red-500/50 rounded-xl text-red-500 text-sm animate-shake">
                            {error}
                        </div>
                    )}

                    <div className="grid grid-cols-2 gap-4 mb-6">
                        <button
                            onClick={() => setRole('student')}
                            className={`p-4 rounded-xl border-2 flex flex-col items-center gap-2 transition-all ${role === 'student'
                                ? 'border-blue-600 bg-blue-600/10 text-white'
                                : 'border-gray-700 bg-[#1F2937]/50 text-gray-400 hover:border-gray-600'
                                }`}
                        >
                            <span className={`w-3 h-3 rounded-full border-2 ${role === 'student' ? 'border-blue-400 bg-blue-400' : 'border-gray-500'}`}></span>
                            <span className="font-medium text-sm">I'm a Student</span>
                        </button>
                        <button
                            onClick={() => setRole('teacher')}
                            className={`p-4 rounded-xl border-2 flex flex-col items-center gap-2 transition-all ${role === 'teacher'
                                ? 'border-blue-600 bg-blue-600/10 text-white'
                                : 'border-gray-700 bg-[#1F2937]/50 text-gray-400 hover:border-gray-600'
                                }`}
                        >
                            <span className={`w-3 h-3 rounded-full border-2 ${role === 'teacher' ? 'border-blue-400 bg-blue-400' : 'border-gray-500'}`}></span>
                            <span className="font-medium text-sm">I'm a Teacher</span>
                        </button>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-1.5">Username</label>
                            <input
                                type="text"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                placeholder="john_doe"
                                required
                                className="w-full bg-[#1F2937] border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-blue-500 transition-colors"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-1.5">Email</label>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="your@email.com"
                                required
                                className="w-full bg-[#1F2937] border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-blue-500 transition-colors"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-1.5">Password</label>
                            <div className="relative">
                                <input
                                    type={showPassword ? "text" : "password"}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="••••••••"
                                    required
                                    className="w-full bg-[#1F2937] border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-blue-500 transition-colors"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-3.5 text-gray-400 hover:text-white"
                                >
                                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                </button>
                            </div>
                            <p className="text-xs text-gray-500 mt-1">Must be at least 8 characters</p>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-1.5">Confirm Password</label>
                            <div className="relative">
                                <input
                                    type={showConfirmPassword ? "text" : "password"}
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    placeholder="••••••••"
                                    required
                                    className="w-full bg-[#1F2937] border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-blue-500 transition-colors"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                    className="absolute right-3 top-3.5 text-gray-400 hover:text-white"
                                >
                                    {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                </button>
                            </div>
                        </div>

                        <label className="flex items-center gap-2 cursor-pointer mt-2">
                            <input type="checkbox" required className="rounded border-gray-600 bg-gray-700 text-blue-600 focus:ring-offset-[#111827] w-4 h-4" />
                            <span className="text-gray-400 text-sm">I agree to the <a href="#" className="text-blue-500 hover:underline">Terms of Service</a></span>
                        </label>

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3.5 rounded-xl transition-all shadow-lg shadow-blue-900/20 active:scale-[0.98] mt-4 flex items-center justify-center gap-2 disabled:opacity-50"
                        >
                            {isLoading ? (
                                <>
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                    Creating Account...
                                </>
                            ) : (
                                <>
                                    <span className="text-lg">+</span> Create Account
                                </>
                            )}
                        </button>
                    </form>

                    <p className="mt-6 text-center text-gray-400 text-sm">
                        Already have an account? <button onClick={onLogin} className="text-blue-400 hover:text-blue-300 font-bold hover:underline">Sign in</button>
                    </p>
                </div>
            </div>
        </div>
    );
};
