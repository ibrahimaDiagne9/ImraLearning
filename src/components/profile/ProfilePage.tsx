import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Mail, MapPin, Calendar, BookOpen, Users, Clock, Camera, Loader2, Sparkles } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { updateProfile, getPublicProfile } from '../../services/api';
import { useMessages } from '../../context/MessageContext';
import { AvatarPickerModal } from '../modals/AvatarPickerModal';

interface ProfilePageProps {
    userRole: 'teacher' | 'student';
    onBack: () => void;
}

export const ProfilePage = ({ userRole, onBack }: ProfilePageProps) => {
    const { userId } = useParams();
    const navigate = useNavigate();
    const { user: currentUser } = useAuth();
    const { showToast } = useToast();
    const { createConversation, setActiveConversationId } = useMessages();

    const [profileUser, setProfileUser] = useState<any>(null);
    const [isOwnProfile, setIsOwnProfile] = useState(!userId || userId === currentUser?.id?.toString());

    const isTeacher = userRole === 'teacher';

    const [isLoading, setIsLoading] = useState(false);
    const [isAvatarModalOpen, setIsAvatarModalOpen] = useState(false);
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        location: '',
        timezone: 'UTC',
        bio: ''
    });

    const [stats, setStats] = useState<any>(null);

    useEffect(() => {
        const loadProfile = async () => {
            if (userId && userId !== currentUser?.id?.toString()) {
                setIsLoading(true);
                try {
                    const data = await getPublicProfile(userId);
                    setProfileUser(data);
                    setStats({
                        enrolled_courses: data.courses_count,
                        certificates: data.certificates_count || 0,
                        study_hours: (data as any).study_hours || 0,
                        badges: data.badges_count || 0,
                        xp_points: data.xp_points
                    });
                    setFormData({
                        username: data.username,
                        email: 'Visible when participating',
                        location: data.location || '',
                        timezone: data.timezone || 'UTC',
                        bio: data.bio || ''
                    });
                    setIsOwnProfile(false);
                } catch (error) {
                    console.error('Failed to fetch public profile', error);
                    showToast('Could not load profile', 'error');
                } finally {
                    setIsLoading(false);
                }
            } else if (currentUser) {
                setProfileUser(currentUser);
                setFormData({
                    username: currentUser.username,
                    email: currentUser.email,
                    location: (currentUser as any).location || '',
                    timezone: (currentUser as any).timezone || 'UTC',
                    bio: currentUser.bio || ''
                });
                setIsOwnProfile(true);
                fetchStats();
            }
        };
        loadProfile();
    }, [userId, currentUser]);

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
    const handleMessageClick = async () => {
        if (profileUser) {
            const convId = await createConversation(profileUser.id.toString());
            if (convId) {
                setActiveConversationId(convId);
                navigate('/messages');
            }
        }
    };

    const handleAvatarSave = async (file: File | null, presetUrl: string | null) => {
        setIsLoading(true);
        try {
            const uploadData = new FormData();

            // If they picked a file, append it
            if (file) {
                uploadData.append('avatar', file);
            }
            // If they picked a preset, we fetch the SVG and convert to blob to upload as a file
            else if (presetUrl) {
                const response = await fetch(presetUrl);
                const blob = await response.blob();
                const fileFromBlob = new File([blob], 'preset-avatar.svg', { type: 'image/svg+xml' });
                uploadData.append('avatar', fileFromBlob);
            }
            // Also need to send the existing string fields since it's a unified endpoint on this component
            if (formData.username) uploadData.append('username', formData.username);
            if (formData.location) uploadData.append('location', formData.location);
            if (formData.timezone) uploadData.append('timezone', formData.timezone);
            if (formData.bio) uploadData.append('bio', formData.bio);

            await updateProfile(uploadData);

            // Refresh local auth context/stats silently equivalent here
            showToast('Avatar updated successfully! Refreshing...', 'success');
            setTimeout(() => window.location.reload(), 1500);

        } catch (error) {
            console.error('Failed to update avatar', error);
            showToast('Failed to update avatar. Please try again.', 'error');
        } finally {
            setIsLoading(false);
            setIsAvatarModalOpen(false);
        }
    };

    if (isLoading && !profileUser) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
            </div>
        );
    }

    if (!profileUser) return null;

    const currentLevel = Math.floor((profileUser.xp_points || 0) / 1000) + 1;
    const progressToNext = (((profileUser.xp_points || 0) % 1000) / 1000) * 100;
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
                        <button
                            className={`relative mb-4 group ${isOwnProfile ? 'cursor-pointer' : ''} border-none bg-transparent p-0 outline-none w-24 h-24 rounded-full`}
                            onClick={() => {
                                if (isOwnProfile) {
                                    setIsAvatarModalOpen(true);
                                }
                            }}
                            type="button"
                        >
                            <div className="w-full h-full rounded-full bg-blue-600 flex items-center justify-center text-3xl font-bold text-white overflow-hidden border-4 border-[#111827] shadow-xl">
                                <img
                                    src={profileUser.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${profileUser.username}`}
                                    alt="Profile"
                                    className="w-full h-full object-cover"
                                />
                            </div>
                            {isOwnProfile && (
                                <div className="absolute bottom-0 right-0 bg-blue-600 p-1.5 rounded-full text-white border-2 border-[#111827]">
                                    <Camera className="w-4 h-4" />
                                </div>
                            )}
                            {isOwnProfile && (
                                <div className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                    <Camera className="w-8 h-8 text-white" />
                                </div>
                            )}
                        </button>
                        <h1 className="text-2xl font-bold text-white mb-2">{profileUser.username}</h1>
                        <span className="text-blue-400 text-sm font-medium mb-6">
                            {profileUser.role === 'teacher' ? 'Instructor' : `Pro Learner • Level ${currentLevel}`}
                        </span>

                        {isOwnProfile ? (
                            !isTeacher && (
                                <div className="w-full mb-6">
                                    <div className="flex justify-between text-xs text-gray-400 mb-1.5">
                                        <span>Progress to Lvl {currentLevel + 1}</span>
                                        <span className="text-blue-400">{profileUser.xp_points % 1000} / 1000 XP</span>
                                    </div>
                                    <div className="h-1.5 w-full bg-gray-800 rounded-full overflow-hidden">
                                        <div className="h-full bg-blue-600 rounded-full" style={{ width: `${progressToNext}%` }}></div>
                                    </div>
                                </div>
                            )
                        ) : (
                            <button
                                onClick={handleMessageClick}
                                className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-xl font-bold transition-all shadow-lg shadow-blue-500/20 mb-6 flex items-center justify-center gap-2"
                            >
                                <Mail className="w-4 h-4" />
                                Message {profileUser.username}
                            </button>
                        )}

                        <div className="w-full space-y-3 text-sm">
                            {isOwnProfile && (
                                <div className="flex items-center gap-3 text-gray-400">
                                    <Mail className="w-4 h-4" />
                                    <span className="truncate">{profileUser.email}</span>
                                </div>
                            )}
                            <div className="flex items-center gap-3 text-gray-400">
                                <MapPin className="w-4 h-4" />
                                <span>{profileUser.location || 'Not specified'}</span>
                            </div>
                            <div className="flex items-center gap-3 text-gray-400">
                                <Calendar className="w-4 h-4" />
                                <span>Joined {new Date(profileUser.date_joined).toLocaleDateString()}</span>
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
                                    <Sparkles className="w-4 h-4 text-blue-400" />
                                    <span>XP Points</span>
                                </div>
                                <span className="font-bold text-white">{stats?.xp_points || 0}</span>
                            </div>
                            <div className="flex justify-between items-center text-sm">
                                <div className="flex items-center gap-2 text-gray-400">
                                    <Clock className="w-4 h-4" />
                                    <span>{isTeacher ? 'Hours Taught' : 'Learning Hours'}</span>
                                </div>
                                <span className="font-bold text-white">{stats?.study_hours || 0} Hours</span>
                            </div>
                            <div className="flex justify-between items-center text-sm">
                                <div className="flex items-center gap-2 text-gray-400">
                                    <Users className="w-4 h-4" />
                                    <span>Badges</span>
                                </div>
                                <span className="font-bold text-white">{stats?.badges || 0}</span>
                            </div>
                        </div>
                    </div>

                    {!isTeacher && isOwnProfile && (
                        <div className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-xl p-6 shadow-xl shadow-blue-900/20">
                            <h4 className="text-white font-bold mb-2">Want to teach?</h4>
                            <p className="text-blue-100 text-xs mb-4 leading-relaxed">
                                Join our community of instructors and share your knowledge with thousands of students.
                            </p>
                            <button
                                onClick={() => navigate('/memberships')}
                                className="w-full bg-white text-blue-600 py-2.5 rounded-lg text-sm font-bold hover:bg-blue-50 transition-colors"
                            >
                                Become an Instructor
                            </button>
                        </div>
                    )}
                </div>

                {/* Right Column - Settings or Bio */}
                <div className="lg:col-span-2 space-y-8">
                    <div className="bg-[#111827] border border-gray-800 rounded-xl p-8">
                        <div className="flex justify-between items-center mb-8">
                            <h2 className="text-xl font-bold text-white">
                                {isOwnProfile ? 'Profile Settings' : `${profileUser.username}'s Profile`}
                            </h2>
                            {isOwnProfile && (
                                <button
                                    onClick={handleSave}
                                    disabled={isLoading}
                                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-50 flex items-center gap-2"
                                >
                                    {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
                                    Save Changes
                                </button>
                            )}
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

            <AvatarPickerModal
                isOpen={isAvatarModalOpen}
                onClose={() => setIsAvatarModalOpen(false)}
                onSelect={handleAvatarSave}
                currentAvatarUrl={profileUser.avatar}
                username={profileUser.username}
            />
        </div >
    );
};
