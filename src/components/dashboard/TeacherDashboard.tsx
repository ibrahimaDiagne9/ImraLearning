import { Video, Plus, FileText, Users, BarChart2, TrendingUp, Sparkles, ArrowRight } from 'lucide-react';
import { DashboardHeader } from './DashboardHeader';
import { ActionCard } from './ActionCard';
import { StatCard } from './StatCard';
import { UpcomingClasses } from './UpcomingClasses';
import { RecentActivity } from './RecentActivity';
import { PendingTasks } from './PendingTasks';
import { RevenuePerformance } from './RevenuePerformance';
import { useAnalytics } from '../../hooks/useAnalytics';

interface TeacherDashboardProps {
    onOpenModal?: (modal: string) => void;
    onNavigate?: (page: any) => void;
}

export const TeacherDashboard = ({ onOpenModal, onNavigate }: TeacherDashboardProps) => {
    const { data, isLoading } = useAnalytics();

    if (isLoading) {
        return (
            <div className="p-6 max-w-7xl mx-auto flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
        );
    }
    return (
        <div className="p-6 max-w-7xl mx-auto space-y-8">
            <DashboardHeader />

            {/* Upgrade Banner */}
            <div className="relative overflow-hidden bg-gradient-to-r from-blue-900/40 to-indigo-900/40 border border-blue-500/20 rounded-3xl p-8 flex flex-col md:flex-row items-center justify-between gap-8 group">
                <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-110 transition-transform duration-700">
                    <TrendingUp className="w-32 h-32 text-blue-400" />
                </div>

                <div className="relative z-10 space-y-3 text-center md:text-left">
                    <div className="inline-flex items-center gap-2 bg-blue-500/20 text-blue-300 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border border-blue-500/30">
                        <Sparkles className="w-3 h-3" />
                        Platform Exclusive
                    </div>
                    <h2 className="text-3xl font-black text-white tracking-tight">
                        Grow your revenue by <span className="text-blue-400 underline decoration-blue-500/40 underline-offset-4">10%</span>
                    </h2>
                    <p className="text-gray-400 font-medium max-w-lg">
                        Upgrade to Teacher Pro today to reduce platform fees from 15% down to 5% and unlock advanced marketing tools.
                    </p>
                </div>

                <button
                    onClick={() => onNavigate?.('memberships')}
                    className="relative z-10 flex items-center gap-3 bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-2xl font-bold shadow-xl shadow-blue-900/30 transition-all hover:scale-105 active:scale-95 group/btn"
                >
                    Upgrade Now
                    <ArrowRight className="w-5 h-5 group-hover/btn:translate-x-1 transition-transform" />
                </button>
            </div>

            <RevenuePerformance data={data} />

            {/* Action Cards Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="relative group">
                    <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl blur opacity-30 group-hover:opacity-100 transition duration-1000 group-hover:duration-200"></div>
                    <ActionCard
                        title="Go Live"
                        description="Start a live session"
                        icon={Video}
                        primary={true}
                        onClick={() => onOpenModal?.('go-live')}
                    />
                </div>

                <ActionCard
                    title="Create Course"
                    description="Build a new course"
                    icon={Plus}
                    onClick={() => onOpenModal?.('create-course')}
                />
                <ActionCard
                    title="Add Assignment"
                    description="Create homework"
                    icon={FileText}
                    onClick={() => onOpenModal?.('create-assignment')}
                />
                <ActionCard
                    title="Manage Students"
                    description="Invite new students"
                    icon={Users}
                    onClick={() => onOpenModal?.('invite-student')}
                />
            </div>

            {/* Stats Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard
                    title="Total Students"
                    value={data?.total_students.toLocaleString() || '0'}
                    trendValue="+12%"
                    icon={Users}
                    iconColorClass="text-blue-400"
                    iconBgClass="bg-blue-500/10"
                />

                <StatCard
                    title="Net Revenue"
                    value={`$${data?.total_revenue.toLocaleString() || '0'}`}
                    trendValue="+15%"
                    icon={TrendingUp}
                    iconColorClass="text-green-400"
                    iconBgClass="bg-green-500/10"
                />

                <StatCard
                    title="Assignments"
                    value={data?.total_assignments.toString() || '0'}
                    trendValue="Ready to grade"
                    icon={FileText}
                    iconColorClass="text-white"
                    iconBgClass="bg-gray-700"
                />

                <StatCard
                    title="Completion Rate"
                    value={`${data?.avg_completion_rate || 0}%`}
                    trendValue="+5%"
                    icon={BarChart2}
                    iconColorClass="text-purple-400"
                    iconBgClass="bg-purple-500/10"
                />
            </div>

            {/* Content Row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <PendingTasks />
                <UpcomingClasses />
            </div>

            <div className="mt-8">
                <RecentActivity />
            </div>
        </div>
    );
};
