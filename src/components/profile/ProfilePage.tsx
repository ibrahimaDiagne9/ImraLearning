import { useState, useEffect } from 'react';
import { ArrowLeft, Mail, MapPin, Calendar, BookOpen, Users, Clock, Camera, Loader2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { updateProfile } from '../../services/api';

interface ProfilePageProps {
    userRole: 'teacher' | 'student';
    onBack: () => void;
}

export const ProfilePage = ({ userRole, onBack }: ProfilePageProps) => {
    const { user } = useAuth();
    const { showToast } = useToast();
    const isTeacher = userRole === 'teacher';

    const [isLoading, setIsLoading] = useState(false);
    const [formData, setFormData] = useState({
        username: user?.username || '',
        email: user?.email || '',
        location: (user as any)?.location || '',
        timezone: (user as any)?.timezone || 'UTC',
        bio: user?.bio || ''
    });

    const [stats, setStats] = useState<any>(null);

    useEffect(() => {
        if (user) {
            setFormData({
                username: user.username,
                email: user.email,
                location: (user as any).location || '',
                timezone: (user as any).timezone || 'UTC',
                bio: user.bio || ''
            });
            fetchStats();
        }
    }, [user]);

    const fetchStats = async () => {
        try {
            // Reusing getStudentAnalytics for now. If teacher stats are needed, a new endpoint might be required.
            // For now, we assume user is student or we show what we have.
            const data = await import('../../services/api').then(m => m.getStudentAnalytics());
            setStats(data);
        } catch (error) {
            console.error('Failed to fetch stats', error);
        }
    };

    const handleSave = async () => {
        setIsLoading(true);
        try {
            await updateProfile(formData);
            showToast('Profile updated successfully!', 'success');
        } catch (error) {
            console.error('Failed to update profile', error);
            showToast('Failed to update profile. Please try again.', 'error');
        } finally {
            setIsLoading(false);
        }
    };

    if (!user) return null;

    const currentLevel = Math.floor(user.xp_points / 1000) + 1;
    const progressToNext = ((user.xp_points % 1000) / 1000) * 100;
    return (
        <div className="p-6 max-w-7xl mx-auto">
            <button
                onClick={onBack}
                className="flex items-center gap-2 text-gray-400 hover:text-white mb-6 transition-colors text-sm font-medium"
            >
                <ArrowLeft className="w-4 h-4" />
                Back to Dashboard
            </button>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Column - Profile Info */}
                <div className="space-y-6">
                    {/* User Card */}
                    <div className="bg-[#111827] border border-gray-800 rounded-xl p-8 flex flex-col items-center text-center">
                        <div className="relative mb-4 group cursor-pointer">
                            <div className="w-24 h-24 rounded-full bg-blue-600 flex items-center justify-center text-3xl font-bold text-white overflow-hidden border-4 border-[#111827] shadow-xl">
                                <img
                                    src={(user as any).avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.username}`}
                                    alt="Profile"
                                    className="w-full h-full object-cover"
                                />
                            </div>
                            <div className="absolute bottom-0 right-0 bg-blue-600 p-1.5 rounded-full text-white border-2 border-[#111827]">
                                <Camera className="w-4 h-4" />
                            </div>
                        </div>

                        <h2 className="text-xl font-bold text-white mb-1">
                            {user.username}
                        </h2>
                        <span className="text-blue-400 text-sm font-medium mb-6">
                            {isTeacher ? 'Instructor' : `Pro Learner • Level ${currentLevel}`}
                        </span>

                        {!isTeacher && (
                            <div className="w-full mb-6">
                                <div className="flex justify-between text-xs text-gray-400 mb-1.5">
                                    <span>Progress to Lvl {currentLevel + 1}</span>
                                    <span className="text-blue-400">{user.xp_points % 1000} / 1000 XP</span>
                                </div>
                                <div className="h-1.5 w-full bg-gray-800 rounded-full overflow-hidden">
                                    <div className="h-full bg-blue-600 rounded-full" style={{ width: `${progressToNext}%` }}></div>
                                </div>
                            </div>
                        )}

                        <div className="w-full space-y-3 text-sm">
                            <div className="flex items-center gap-3 text-gray-400">
                                <Mail className="w-4 h-4" />
                                <span className="truncate">{user.email}</span>
                            </div>
                            <div className="flex items-center gap-3 text-gray-400">
                                <MapPin className="w-4 h-4" />
                                <span>{(user as any).location || 'Not specified'}</span>
                            </div>
                            <div className="flex items-center gap-3 text-gray-400">
                                <Calendar className="w-4 h-4" />
                                <span>Joined {new Date((user as any).date_joined).toLocaleDateString()}</span>
                            </div>
                        </div>
                    </div>

                    {/* Stats Card */}
                    <div className="bg-[#111827] border border-gray-800 rounded-xl p-6">
                        <h3 className="font-bold text-white mb-4">
                            {isTeacher ? 'Teaching Statistics' : 'Learning Statistics'}
                        </h3>
                        <div className="space-y-4">
                            <div className="flex justify-between items-center text-sm">
                                <div className="flex items-center gap-2 text-gray-400">
                                    <BookOpen className="w-4 h-4" />
                                    <span>{isTeacher ? 'Courses' : 'Enrolled'}</span>
                                </div>
                                <span className="font-bold text-white">{stats?.enrolled_courses || 0}</span>
                            </div>
                            <div className="flex justify-between items-center text-sm">
                                <div className="flex items-center gap-2 text-gray-400">
                                    <Users className="w-4 h-4" />
                                    <span>{isTeacher ? 'Students' : 'Certificates'}</span>
                                </div>
                                <span className="font-bold text-white">{stats?.certificates || 0}</span>
                            </div>
                            <div className="flex justify-between items-center text-sm">
                                <div className="flex items-center gap-2 text-gray-400">
                                    <Clock className="w-4 h-4" />
                                    <span>{isTeacher ? 'Hours Taught' : 'Learning Hours'}</span>
                                </div>
                                <span className="font-bold text-white">{stats?.study_hours || 0} Hours</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Column - Settings */}
                <div className="lg:col-span-2 space-y-8">
                    <div className="bg-[#111827] border border-gray-800 rounded-xl p-8">
                        <div className="flex justify-between items-center mb-8">
                            <h2 className="text-xl font-bold text-white">Profile Settings</h2>
                            <button
                                onClick={handleSave}
                                disabled={isLoading}
                                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-50 flex items-center gap-2"
                            >
                                {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
                                Save Changes
                            </button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-400 mb-2">Username</label>
                                <input
                                    type="text"
                                    value={formData.username}
                                    onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                                    className="w-full bg-[#1F2937] border border-gray-700 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-blue-500 transition-colors text-sm"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-400 mb-2">Email Address</label>
                                <input
                                    type="email"
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                    className="w-full bg-[#1F2937] border border-gray-700 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-blue-500 transition-colors text-sm"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-400 mb-2">Location</label>
                                <input
                                    type="text"
                                    value={formData.location}
                                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                                    placeholder="e.g. San Francisco, CA"
                                    className="w-full bg-[#1F2937] border border-gray-700 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-blue-500 transition-colors text-sm"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-400 mb-2">Timezone</label>
                                <select
                                    value={formData.timezone}
                                    onChange={(e) => setFormData({ ...formData, timezone: e.target.value })}
                                    className="w-full bg-[#1F2937] border border-gray-700 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-blue-500 transition-colors text-sm appearance-none"
                                >
                                    <option value="UTC">UTC</option>
                                    <option value="Pacific Time (PT)">Pacific Time (PT)</option>
                                    <option value="Eastern Time (ET)">Eastern Time (ET)</option>
                                    <option value="GMT">GMT</option>
                                </select>
                            </div>
                        </div>

                        <div className="mb-8">
                            <label className="block text-sm font-medium text-gray-400 mb-2">Bio</label>
                            <textarea
                                rows={4}
                                value={formData.bio}
                                onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                                placeholder="Tell us about yourself..."
                                className="w-full bg-[#1F2937] border border-gray-700 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-blue-500 transition-colors text-sm resize-none"
                            ></textarea>
                        </div>

                        <div className="border-t border-gray-800 pt-8 mb-8">
                            <h3 className="font-bold text-white mb-6">Notification Preferences</h3>
                            <div className="space-y-4">
                                <label className="flex items-center justify-between cursor-pointer">
                                    <span className="text-gray-300 text-sm font-medium">Email notifications</span>
                                    <input type="checkbox" className="w-5 h-5 rounded border-gray-600 bg-gray-700 text-blue-600 focus:ring-offset-[#111827]" defaultChecked />
                                </label>
                                <label className="flex items-center justify-between cursor-pointer">
                                    <span className="text-gray-300 text-sm font-medium">Assignment reminders</span>
                                    <input type="checkbox" className="w-5 h-5 rounded border-gray-600 bg-gray-700 text-blue-600 focus:ring-offset-[#111827]" defaultChecked />
                                </label>
                                <label className="flex items-center justify-between cursor-pointer">
                                    <span className="text-gray-300 text-sm font-medium">Live session alerts</span>
                                    <input type="checkbox" className="w-5 h-5 rounded border-gray-600 bg-gray-700 text-blue-600 focus:ring-offset-[#111827]" defaultChecked />
                                </label>
                                <label className="flex items-center justify-between cursor-pointer">
                                    <span className="text-gray-300 text-sm font-medium">Course updates</span>
                                    <input type="checkbox" className="w-5 h-5 rounded border-gray-600 bg-gray-700 text-blue-600 focus:ring-offset-[#111827]" />
                                </label>
                            </div>
                        </div>

                        <div className="border-t border-gray-800 pt-8">
                            <h3 className="font-bold text-white mb-6">Account Settings</h3>
                            <div className="flex gap-4">
                                <button className="bg-[#1F2937] border border-gray-700 hover:bg-gray-800 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
                                    Change Password
                                </button>
                                <button className="bg-red-500/10 border border-red-500/20 hover:bg-red-500/20 text-red-500 px-4 py-2 rounded-lg text-sm font-medium transition-colors">
                                    Delete Account
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
