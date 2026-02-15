import { useState } from 'react';
import { MessageSquare, Video, BarChart2, CheckCircle, Eye, EyeOff, Loader2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';

interface LoginPageProps {
    onSignup: () => void;
}

export const LoginPage = ({ onSignup }: LoginPageProps) => {
    const { login } = useAuth();
    const navigate = useNavigate();
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError(null);
        try {
            await login({ username, password });
            navigate('/');
        } catch (err: unknown) {
            console.error(err);
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            setError((err as any).response?.data?.detail || 'Invalid username or password');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#0B1120] flex items-center justify-center p-4">
            <div className="flex w-full max-w-5xl bg-[#111827]/50 rounded-3xl overflow-hidden border border-gray-800 shadow-2xl backdrop-blur-sm min-h-[600px]">

                {/* Left Side - Branding & Features */}
                <div className="hidden lg:flex w-1/2 bg-[#111827] p-12 flex-col justify-between relative overflow-hidden">
                    <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-600 to-purple-600"></div>
                    <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
                    <div className="absolute bottom-0 left-0 w-64 h-64 bg-purple-600/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2"></div>

                    <div>
                        <div className="flex items-center gap-3 mb-2">
                            <div className="bg-blue-600 p-2.5 rounded-xl">
                                <MessageSquare className="w-6 h-6 text-white" />
                            </div>
                            <h1 className="text-2xl font-bold text-white">EduPlatform</h1>
                        </div>
                        <p className="text-gray-400 pl-14">Interactive Community Learning</p>
                    </div>

                    <div className="space-y-6">
                        <div className="bg-[#1F2937]/50 p-4 rounded-xl border border-gray-700/50 backdrop-blur-sm hover:border-blue-500/30 transition-colors">
                            <div className="flex items-center gap-4 mb-2">
                                <div className="p-2 bg-blue-500/20 rounded-lg text-blue-400">
                                    <MessageSquare className="w-5 h-5" />
                                </div>
                                <h3 className="font-bold text-white">Interactive Community</h3>
                            </div>
                            <p className="text-gray-400 text-sm pl-13">Connect with students and teachers worldwide in real-time discussions.</p>
                        </div>

                        <div className="bg-[#1F2937]/50 p-4 rounded-xl border border-gray-700/50 backdrop-blur-sm hover:border-green-500/30 transition-colors">
                            <div className="flex items-center gap-4 mb-2">
                                <div className="p-2 bg-green-500/20 rounded-lg text-green-400">
                                    <Video className="w-5 h-5" />
                                </div>
                                <h3 className="font-bold text-white">Live Sessions</h3>
                            </div>
                            <p className="text-gray-400 text-sm pl-13">Join real-time classes and workshops with seamless video integration.</p>
                        </div>

                        <div className="bg-[#1F2937]/50 p-4 rounded-xl border border-gray-700/50 backdrop-blur-sm hover:border-purple-500/30 transition-colors">
                            <div className="flex items-center gap-4 mb-2">
                                <div className="p-2 bg-purple-500/20 rounded-lg text-purple-400">
                                    <BarChart2 className="w-5 h-5" />
                                </div>
                                <h3 className="font-bold text-white">Track Progress</h3>
                            </div>
                            <p className="text-gray-400 text-sm pl-13">Monitor assignments, grades, and achievements in one place.</p>
                        </div>
                    </div>

                    <div className="text-xs text-gray-500 flex justify-between">
                        <span>© 2026 EduPlatform Inc.</span>
                        <div className="flex gap-4">
                            <a href="#" className="hover:text-gray-300">Privacy</a>
                            <a href="#" className="hover:text-gray-300">Terms</a>
                        </div>
                    </div>
                </div>

                {/* Right Side - Login Form */}
                <div className="w-full lg:w-1/2 p-8 md:p-12 flex flex-col justify-center bg-[#0F1623]">
                    <div className="mb-8 text-center">
                        <h2 className="text-3xl font-bold text-white mb-2">Welcome Back</h2>
                        <p className="text-gray-400">Sign in to continue your learning journey</p>
                    </div>

                    {error && (
                        <div className="mb-6 p-4 bg-red-500/10 border border-red-500/50 rounded-xl text-red-500 text-sm animate-shake">
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">Username</label>
                            <input
                                type="text"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                placeholder="Enter your username"
                                required
                                className="w-full bg-[#1F2937] border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-blue-500 transition-colors"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">Password</label>
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
                        </div>

                        <div className="flex items-center justify-between text-sm">
                            <label className="flex items-center gap-2 cursor-pointer">
                                <div className="relative flex items-center">
                                    <input type="checkbox" className="peer w-4 h-4 opacity-0 absolute" />
                                    <div className="w-4 h-4 border border-gray-600 rounded bg-[#1F2937] peer-checked:bg-blue-600 peer-checked:border-blue-600 flex items-center justify-center transition-colors">
                                        <CheckCircle className="w-3 h-3 text-white opacity-0 peer-checked:opacity-100" />
                                    </div>
                                </div>
                                <span className="text-gray-400">Remember me</span>
                            </label>
                            <a href="#" className="text-blue-400 hover:text-blue-300 font-medium">Forgot password?</a>
                        </div>

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3.5 rounded-xl transition-all shadow-lg shadow-blue-900/20 active:scale-[0.98] flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isLoading ? (
                                <>
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                    Signing In...
                                </>
                            ) : (
                                'Sign In'
                            )}
                        </button>
                    </form>

                    <p className="mt-8 text-center text-gray-400 text-sm">
                        Don't have an account? <button onClick={onSignup} className="text-blue-400 hover:text-blue-300 font-bold hover:underline">Sign up for free</button>
                    </p>
                </div>
            </div>
        </div>
    );
};
