import { useState, useRef, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Bell, MessageSquare, BookOpen, FileText, LogOut, User, Crown, Sparkles, Search } from 'lucide-react';
import { NotificationsPopup } from '../notifications/NotificationsPopup';
import { useAuth } from '../../context/AuthContext';
import { useNotifications } from '../../context/NotificationContext';

interface NavbarProps {
    onLogout?: () => void;
}

export const Navbar = ({ onLogout }: NavbarProps) => {
    const { userRole, isPro, logout, xp } = useAuth();
    const { unreadCount } = useNotifications();
    const navigate = useNavigate();
    const location = useLocation();
    const activePage = location.pathname.substring(1).split('/')[0] || 'dashboard';

    const [showNotifications, setShowNotifications] = useState(false);
    const [showUserMenu, setShowUserMenu] = useState(false);
    const [navSearchQuery, setNavSearchQuery] = useState('');
    const userMenuRef = useRef<HTMLDivElement>(null);

    const handleLogout = () => {
        logout();
        onLogout?.();
        navigate('/login');
    };

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        if (navSearchQuery.trim()) {
            navigate(`/courses?search=${encodeURIComponent(navSearchQuery.trim())}`);
            setNavSearchQuery('');
        }
    };

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
                setShowUserMenu(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    return (
        <nav className="bg-surface border-b border-gray-700 h-16 flex items-center justify-between px-6 sticky top-0 z-50">
            {/* Left Section: Logo + Toggle */}
            <div className="flex items-center gap-6">
                <div className="flex items-center gap-2">
                    <div className="bg-primary/20 p-2 rounded-lg">
                        <MessageSquare className="w-6 h-6 text-primary" />
                    </div>
                    <span className="text-xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                        IMRA Class
                    </span>
                </div>

                <div className="flex items-center bg-gray-800 rounded-lg p-1.5 px-3 border border-gray-700">
                    <span className="text-sm font-medium text-gray-300 flex items-center gap-2">
                        <span className={`w-2 h-2 rounded-full ${userRole === 'teacher' ? 'bg-blue-500' : 'bg-green-500'}`}></span>
                        {userRole === 'teacher' ? 'Teacher' : 'Student'}
                    </span>
                </div>

                {/* Global Search */}
                <form onSubmit={handleSearch} className="hidden lg:block relative ml-4">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                    <input
                        type="text"
                        placeholder="Search courses..."
                        value={navSearchQuery}
                        onChange={(e) => setNavSearchQuery(e.target.value)}
                        className="bg-[#111827] border border-gray-800 rounded-xl py-2 pl-10 pr-4 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-blue-500/50 w-64 transition-all focus:w-80 shadow-inner"
                    />
                </form>
            </div>

            {/* Center Section: Navigation */}
            <div className="hidden md:flex items-center gap-2 absolute left-1/2 -translate-x-1/2">
                <button
                    onClick={() => navigate('/dashboard')}
                    className={`px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 transition-colors ${activePage === 'dashboard'
                        ? 'bg-blue-600 text-white'
                        : 'text-gray-400 hover:text-white'
                        }`}
                >
                    <div className="grid grid-cols-2 gap-0.5 w-3.5 h-3.5">
                        <span className={`rounded-[1px] ${activePage === 'dashboard' ? 'bg-white' : 'bg-current'}`}></span>
                        <span className={`rounded-[1px] ${activePage === 'dashboard' ? 'bg-white' : 'bg-current'}`}></span>
                        <span className={`rounded-[1px] ${activePage === 'dashboard' ? 'bg-white' : 'bg-current'}`}></span>
                        <span className={`rounded-[1px] ${activePage === 'dashboard' ? 'bg-white' : 'bg-current'}`}></span>
                    </div>
                    Dashboard
                </button>
                <button
                    onClick={() => navigate('/courses')}
                    className={`px-3 py-2 rounded-lg text-sm font-medium flex items-center gap-2 transition-colors ${activePage === 'courses'
                        ? 'bg-blue-600 text-white'
                        : 'text-gray-400 hover:text-white'
                        }`}
                >
                    <BookOpen className="w-4 h-4" />
                    Courses
                </button>
                <button
                    onClick={() => navigate('/discussions')}
                    className={`px-3 py-2 rounded-lg text-sm font-medium flex items-center gap-2 transition-colors ${activePage === 'discussions'
                        ? 'bg-blue-600 text-white'
                        : 'text-gray-400 hover:text-white'
                        }`}
                >
                    <MessageSquare className="w-4 h-4" />
                    Discussions
                </button>
                <button
                    onClick={() => navigate('/messages')}
                    className={`px-3 py-2 rounded-lg text-sm font-medium flex items-center gap-2 transition-colors ${activePage === 'messages'
                        ? 'bg-blue-600 text-white'
                        : 'text-gray-400 hover:text-white'
                        }`}
                >
                    <MessageSquare className="w-4 h-4" />
                    Messages
                </button>
                {userRole === 'teacher' && (
                    <button
                        onClick={() => navigate('/gradebook')}
                        className={`px-3 py-2 rounded-lg text-sm font-medium flex items-center gap-2 transition-colors ${activePage === 'gradebook'
                            ? 'bg-blue-600 text-white'
                            : 'text-gray-400 hover:text-white'
                            }`}
                    >
                        <FileText className="w-4 h-4" />
                        Gradebook
                    </button>
                )}
            </div>

            {/* Right Section: Icons + Profile */}
            <div className="flex items-center gap-4">
                {!isPro && activePage !== 'memberships' && activePage !== 'checkout' && (
                    <button
                        onClick={() => navigate('/memberships')}
                        className="hidden lg:flex items-center gap-2 bg-gradient-to-r from-yellow-500 to-amber-600 hover:from-yellow-600 hover:to-amber-700 text-black px-4 py-1.5 rounded-full text-xs font-bold transition-all shadow-lg shadow-yellow-900/20 active:scale-95"
                    >
                        <Crown className="w-3.5 h-3.5" />
                        {userRole === 'teacher' ? 'Upgrade to Pro' : 'Become Pro'}
                    </button>
                )}
                <div className="relative">
                    <button
                        onClick={() => setShowNotifications(!showNotifications)}
                        className="p-2 hover:bg-gray-700 rounded-full transition-colors relative"
                    >
                        <Bell className="w-5 h-5 text-gray-300" />
                        {unreadCount > 0 && <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full shadow-[0_0_8px_rgba(239,68,68,0.5)]"></span>}
                    </button>
                    {showNotifications && <NotificationsPopup onClose={() => setShowNotifications(false)} />}
                </div>

                {/* XP Badge - Only for Students */}
                {userRole === 'student' && (
                    <div className="hidden sm:flex flex-col items-end mx-2">
                        <div className="flex items-center gap-1.5 bg-blue-500/10 border border-blue-500/20 px-3 py-1 rounded-full">
                            <Sparkles className="w-3.5 h-3.5 text-blue-400" />
                            <span className="text-xs font-black text-blue-400">{xp} <span className="text-[10px] opacity-70">XP</span></span>
                        </div>
                        <div className="w-20 h-1 bg-gray-800 rounded-full mt-1.5 overflow-hidden">
                            <div className="h-full bg-blue-500" style={{ width: `${(xp % 1000) / 10}%` }}></div>
                        </div>
                    </div>
                )}

                <div className="relative" ref={userMenuRef}>
                    <button
                        onClick={() => setShowUserMenu(!showUserMenu)}
                        className={`flex items-center gap-3 hover:bg-gray-700 py-1.5 px-3 rounded-full transition-colors ${activePage === 'profile' ? 'bg-gray-700' : ''}`}
                    >
                        {isPro && (
                            <span className="bg-blue-600 text-white text-[10px] font-black px-1.5 py-0.5 rounded shadow-sm shadow-blue-900/40">PRO</span>
                        )}
                        <div className="w-8 h-8 bg-gray-700 rounded-full flex items-center justify-center text-gray-300 overflow-hidden border border-gray-600">
                            <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Professor" alt="Profile" className="w-full h-full object-cover" />
                        </div>
                    </button>

                    {showUserMenu && (
                        <div className="absolute top-full right-0 mt-2 w-48 bg-[#111827] border border-gray-800 rounded-xl shadow-2xl z-50 py-1 text-sm font-medium animate-in fade-in zoom-in-95 duration-200">
                            <button
                                onClick={() => {
                                    navigate('/profile');
                                    setShowUserMenu(false);
                                }}
                                className="w-full px-4 py-2 text-left text-gray-300 hover:text-white hover:bg-white/5 flex items-center gap-2"
                            >
                                <User className="w-4 h-4" />
                                Profile
                            </button>
                            <button
                                onClick={() => {
                                    navigate('/memberships');
                                    setShowUserMenu(false);
                                }}
                                className="w-full px-4 py-2 text-left text-gray-300 hover:text-white hover:bg-white/5 flex items-center gap-2"
                            >
                                <Crown className="w-4 h-4 text-yellow-500" />
                                Memberships
                            </button>
                            <button
                                onClick={() => {
                                    handleLogout();
                                    setShowUserMenu(false);
                                }}
                                className="w-full px-4 py-2 text-left text-red-400 hover:text-red-300 hover:bg-red-500/10 flex items-center gap-2 border-t border-gray-800 mt-1"
                            >
                                <LogOut className="w-4 h-4" />
                                Log Out
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </nav>
    );
};
