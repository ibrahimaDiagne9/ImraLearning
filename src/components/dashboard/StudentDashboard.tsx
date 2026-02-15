import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Award, Clock, ChevronRight, Trophy, BookOpen, Video, Play, FileText, Plus, Globe, Sparkles, Briefcase, MessageSquare } from 'lucide-react';

import { useAuth } from '../../context/AuthContext';
import { getStudentAnalytics, getCertificates, getLiveSessions, getLeaderboard, getCourses, getPendingTasks } from '../../services/api';
import { CertificateCard } from './CertificateCard';
import { StatCard } from './StatCard';
import { DashboardHeader } from './DashboardHeader';
import { UpcomingClasses } from './UpcomingClasses';
import { RecentActivity } from './RecentActivity';
import { StudentReport } from './StudentReport';

interface StudentDashboardProps {
    onOpenModal?: (modal: string) => void;
}

export const StudentDashboard = ({ onOpenModal }: StudentDashboardProps) => {
    interface LiveSession { id: number; title: string; course_title?: string; instructor_name: string; description: string; meeting_link: string; }
    interface LeaderboardEntry { id: number; username: string; xp_points: number; avatar?: string; }
    interface DashboardStats { enrolled_courses: number; certificates: number; study_hours: number; }
    interface Certificate { id?: number; certificate_id: string; course_title: string; issued_at: string; }
    interface Course { id: number; title: string; thumbnail?: string; instructor_name: string; progress_percentage: number; }
    interface Task { id: string; title: string; description: string; time: string; }

    const navigate = useNavigate();
    const { xp, user } = useAuth();
    const [liveSessions, setLiveSessions] = useState<LiveSession[]>([]);
    const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
    const [stats, setStats] = useState<DashboardStats | null>(null);
    const [earnedCertificates, setEarnedCertificates] = useState<Certificate[]>([]);
    const [enrolledCourses, setEnrolledCourses] = useState<Course[]>([]);
    const [tasks, setTasks] = useState<Task[]>([]);
    const [isSessionsLoading, setIsSessionsLoading] = useState(true);
    const [activeView, setActiveView] = useState<'dashboard' | 'report'>('dashboard');

    useEffect(() => {
        const fetchData = async () => {
            try {
                const sessions = await getLiveSessions({ is_live: true });
                setLiveSessions(sessions);

                const lbData = await getLeaderboard();
                setLeaderboard(lbData);

                const statsData = await getStudentAnalytics();
                setStats(statsData);

                const certsRes = await getCertificates();
                setEarnedCertificates(certsRes);

                const coursesRes = await getCourses({ enrolled: true });
                console.log('Enrolled courses fetched:', coursesRes.length, coursesRes);
                setEnrolledCourses(coursesRes);

                const tasksRes = await getPendingTasks();
                setTasks(tasksRes);
            } catch (error) {
                console.error('Failed to fetch dashboard data', error);
            } finally {
                setIsSessionsLoading(false);
            }
        };

        fetchData();
    }, []);

    if (isSessionsLoading) {
        return (
            <div className="flex items-center justify-center h-screen bg-[#0A0F1C]">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
        );
    }
    if (activeView === 'report') {
        return <StudentReport onBack={() => setActiveView('dashboard')} />;
    }

    return (
        <div className="p-6 max-w-7xl mx-auto space-y-8">
            <DashboardHeader />

            {/* Stats Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard
                    icon={BookOpen}
                    title="Enrolled"
                    value={(stats?.enrolled_courses || 0).toString()}
                    iconColorClass="text-blue-400"
                />
                <StatCard
                    icon={Award}
                    title="Certificates"
                    value={(stats?.certificates || 0).toString()}
                    iconColorClass="text-purple-400"
                />
                <StatCard
                    icon={Clock}
                    title="Learning Hours"
                    value={(stats?.study_hours || 0).toString()}
                    iconColorClass="text-orange-400"
                />
                <StatCard
                    icon={MessageSquare}
                    title="XP Points"
                    value={xp.toString()}
                    iconColorClass="text-green-400"
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Continue Learning */}
                <div className="lg:col-span-2 space-y-4">
                    <div className="flex justify-between items-center">
                        <h2 className="text-lg font-bold text-white">Continue Learning</h2>
                        <button className="text-blue-500 hover:text-blue-400 text-sm font-medium">View All</button>
                    </div>

                    <div className="space-y-4">
                        {enrolledCourses.length > 0 ? (
                            (enrolledCourses || []).slice(0, 3).map((course) => (
                                <div key={course.id} className="bg-[#111827] border border-gray-800 rounded-xl p-6 relative overflow-hidden group hover:border-gray-700 transition-all">
                                    <div className="flex items-start justify-between mb-4">
                                        <div className="flex gap-4">
                                            <div className="w-12 h-12 bg-blue-500/20 rounded-lg flex items-center justify-center">
                                                {course.thumbnail ? (
                                                    <img src={course.thumbnail} alt="" className="w-full h-full object-cover rounded-lg" />
                                                ) : (
                                                    <BookOpen className="w-6 h-6 text-blue-400" />
                                                )}
                                            </div>
                                            <div>
                                                <h3 className="font-bold text-white group-hover:text-blue-400 transition-colors">{course.title}</h3>
                                                <p className="text-sm text-gray-400">{course.instructor_name}</p>
                                            </div>
                                        </div>
                                        <span className="text-blue-400 font-bold text-sm">{course.progress_percentage || 0}%</span>
                                    </div>

                                    <div className="w-full bg-gray-800 rounded-full h-2 mb-4">
                                        <div className="bg-blue-500 h-2 rounded-full" style={{ width: `${course.progress_percentage || 0}%` }}></div>
                                    </div>

                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2 text-xs text-gray-500">
                                            <Clock className="w-3 h-3" />
                                            <span>{course.progress_percentage || 0}% Completed</span>
                                        </div>
                                        <button
                                            onClick={() => navigate(`/learn/${course.id}`)}
                                            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                                        >
                                            <Play className="w-3 h-3 fill-current" />
                                            Continue
                                        </button>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="bg-[#111827] border border-dashed border-gray-800 rounded-xl p-12 text-center group hover:border-gray-700 transition-all">
                                <BookOpen className="w-12 h-12 text-gray-700 mx-auto mb-4" />
                                <h3 className="text-white font-bold mb-2">No active courses</h3>
                                <p className="text-gray-500 text-sm mb-6">Browse our catalog to start your learning journey.</p>
                                <button
                                    onClick={() => navigate('/courses')}
                                    className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-bold transition-all shadow-lg shadow-blue-900/40"
                                >
                                    Explore Courses
                                </button>
                            </div>
                        )}
                    </div>

                    {/* Performance Report CTA */}
                    <div className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-3xl p-8 relative overflow-hidden group shadow-2xl shadow-blue-500/20">
                        <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-110 transition-transform duration-500">
                            <Sparkles className="w-24 h-24 text-white" />
                        </div>
                        <div className="relative z-10">
                            <h3 className="text-2xl font-bold text-white mb-2">Track Your Growth</h3>
                            <p className="text-blue-100/80 mb-6 max-w-sm">View detailed charts of your course progress, quiz performance, and academic achievements.</p>
                            <button
                                onClick={() => setActiveView('report')}
                                className="bg-white text-blue-600 px-6 py-3 rounded-2xl font-bold text-sm hover:shadow-xl hover:shadow-white/10 transition-all flex items-center gap-2 group/btn"
                            >
                                View Performance Report
                                <ChevronRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
                            </button>
                        </div>
                    </div>
                </div>

                {/* Sidebar Column */}
                <div className="space-y-8">
                    {/* My Certificates Section */}
                    <div className="bg-[#111827] border border-gray-800 rounded-2xl p-6 relative overflow-hidden group hover:border-blue-500/30 transition-all">
                        <div className="flex justify-between items-center mb-6 relative z-10">
                            <h2 className="text-sm font-black text-white uppercase tracking-widest flex items-center gap-2">
                                <Trophy className="w-4 h-4 text-yellow-500" />
                                My Certificates
                            </h2>
                            {earnedCertificates.length > 0 && (
                                <button className="text-[10px] font-bold text-blue-400 hover:text-blue-300 uppercase tracking-wider">View All</button>
                            )}
                        </div>

                        {earnedCertificates.length > 0 ? (
                            <div className="space-y-4 relative z-10">
                                {(earnedCertificates || []).slice(0, 4).map((cert) => (
                                    <CertificateCard key={cert.certificate_id || cert.id} certificate={cert} />
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-4 relative z-10">
                                <div className="w-10 h-10 bg-gray-800 rounded-xl flex items-center justify-center mx-auto mb-3">
                                    <Award className="w-5 h-5 text-gray-600" />
                                </div>
                                <h3 className="text-white text-xs font-bold mb-1">No Certificates Yet</h3>
                                <p className="text-gray-500 text-[10px] leading-relaxed">Complete courses to 100% to earn your official credentials.</p>
                            </div>
                        )}
                        <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-blue-500/5 rounded-full blur-2xl group-hover:bg-blue-500/10 transition-colors"></div>
                    </div>

                    {/* Assignments Section */}
                    <div className="space-y-4">
                        <div className="flex justify-between items-center">
                            <h2 className="text-sm font-black text-white uppercase tracking-widest flex items-center gap-2">
                                <FileText className="w-4 h-4 text-purple-500" />
                                Assignments
                            </h2>
                            <button className="text-blue-500 hover:text-blue-400 text-[10px] font-bold uppercase tracking-widest">View All</button>
                        </div>

                        <div className="space-y-3">
                            {tasks.length > 0 ? (
                                tasks.filter((t) => t.id.startsWith('assignment-')).map((task) => (
                                    <div key={task.id} className="bg-[#111827] border border-gray-800 rounded-xl p-4 flex items-center justify-between group hover:border-blue-500/30 transition-all">
                                        <div className="flex items-center gap-4">
                                            <div className="bg-blue-500/10 p-3 rounded-lg">
                                                <FileText className="w-6 h-6 text-blue-400" />
                                            </div>
                                            <div>
                                                <h4 className="font-bold text-white group-hover:text-blue-400 transition-colors">{task.title}</h4>
                                                <p className="text-[10px] text-gray-500 uppercase tracking-wider font-bold">{task.description} • {task.time}</p>
                                            </div>
                                        </div>
                                        <button className="bg-blue-600/10 text-blue-400 hover:bg-blue-600 hover:text-white p-2 rounded-lg transition-all">
                                            <ChevronRight className="w-4 h-4" />
                                        </button>
                                    </div>
                                ))
                            ) : (
                                <div className="bg-[#111827] border border-gray-800 rounded-xl p-4 text-center">
                                    <p className="text-xs text-gray-500">No pending assignments!</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Live Sessions */}
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <h2 className="text-sm font-black text-white uppercase tracking-widest flex items-center gap-2">
                                <Video className="w-4 h-4 text-red-500" />
                                Live Now
                            </h2>
                            {liveSessions.length > 0 && (
                                <span className="flex h-2 w-2 relative">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                                    <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
                                </span>
                            )}
                        </div>

                        {liveSessions.length > 0 ? (
                            <div className="space-y-4">
                                {(liveSessions || []).map((session) => (
                                    <div key={session.id} className="bg-[#111827] border border-gray-800 rounded-2xl p-5 space-y-4 border-l-4 border-l-red-500 group hover:border-red-500/30 transition-all">
                                        <div>
                                            <h4 className="text-sm font-bold text-white group-hover:text-red-400 transition-colors">{session.title}</h4>
                                            <p className="text-[10px] text-gray-500 uppercase tracking-widest font-black mt-1">
                                                {session.course_title || 'General Session'} • {session.instructor_name}
                                            </p>
                                        </div>
                                        <p className="text-xs text-gray-400 line-clamp-2">{session.description}</p>
                                        <a
                                            href={session.meeting_link}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="block w-full text-center bg-red-600 hover:bg-red-700 text-white py-2 rounded-lg text-xs font-bold transition-colors shadow-lg shadow-red-900/40"
                                        >
                                            Join Session
                                        </a>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="bg-[#111827] border border-gray-800 rounded-2xl p-6 text-center">
                                <div className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-3">
                                    <Video className="w-5 h-5 text-gray-600" />
                                </div>
                                <h3 className="text-white text-xs font-bold">No Live Sessions</h3>
                                <p className="text-gray-500 text-[10px] mt-1">Check back later for live workshops and Q&As.</p>
                            </div>
                        )}
                    </div>

                    {/* Portfolio */}
                    <div className="space-y-4">
                        <div className="flex justify-between items-center">
                            <h2 className="text-sm font-black text-white uppercase tracking-widest flex items-center gap-2">
                                <Briefcase className="w-4 h-4 text-blue-500" />
                                My Portfolio
                            </h2>
                            <button className="text-gray-400 hover:text-white transition-colors">
                                <Plus className="w-4 h-4" />
                            </button>
                        </div>
                        <div className="bg-[#111827] border border-dashed border-gray-800 rounded-2xl p-6 text-center group hover:border-blue-500/30 transition-all cursor-pointer">
                            <div className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-3 group-hover:bg-blue-600/20 transition-colors">
                                <Globe className="w-5 h-5 text-gray-500 group-hover:text-blue-400" />
                            </div>
                            <h3 className="text-white text-xs font-bold">Showcase Your Work</h3>
                            <button
                                onClick={() => onOpenModal?.('add-project')}
                                className="mt-2 text-[10px] text-blue-400 font-bold uppercase tracking-wider"
                            >
                                Add Project
                            </button>
                        </div>
                    </div>

                    {/* Leaderboard Section */}
                    <div className="bg-[#111827] border border-gray-800 rounded-3xl p-6 relative overflow-hidden">
                        <div className="flex items-center justify-between mb-6 relative z-10">
                            <h3 className="text-[10px] font-black text-white uppercase tracking-widest flex items-center gap-2">
                                <Sparkles className="w-4 h-4 text-blue-400" />
                                Leaderboard
                            </h3>
                        </div>

                        <div className="space-y-4 relative z-10">
                            {(leaderboard || []).slice(0, 5).map((entry, index) => (
                                <div key={entry.id} className={`flex items-center justify-between p-2 rounded-xl transition-all ${user?.id === entry.id ? 'bg-blue-600/10 border border-blue-500/20 shadow-lg' : 'hover:bg-white/5'}`}>
                                    <div className="flex items-center gap-3">
                                        <span className="text-[10px] font-black w-4 text-gray-600">#{index + 1}</span>
                                        <div className="w-6 h-6 rounded-full border border-gray-800 overflow-hidden">
                                            <img src={entry.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${entry.username}`} alt={entry.username} className="w-full h-full object-cover" />
                                        </div>
                                        <span className={`text-[10px] font-bold ${user?.id === entry.id ? 'text-blue-400' : 'text-gray-300'}`}>{user?.id === entry.id ? 'You' : entry.username}</span>
                                    </div>
                                    <span className="text-[10px] font-black text-white">{entry.xp_points?.toLocaleString() || 0} <span className="text-gray-600">XP</span></span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* New Section for Recent Activity and Upcoming Classes */}
                <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-8">
                    <UpcomingClasses />
                    <RecentActivity />
                </div>
            </div>
        </div>
    );
};
