import { useState, useEffect } from 'react';
import { FileText, MessageSquare, CheckCircle, AlertCircle } from 'lucide-react';
import { getRecentActivity } from '../../services/api';

interface ActivityItem {
    id: number | string;
    type: 'assignment' | 'comment' | 'completion' | 'alert';
    title: string;
    description: string;
    time: string;
}

const getActivityIcon = (type: ActivityItem['type']) => {
    switch (type) {
        case 'assignment':
            return { icon: FileText, color: 'text-blue-400', bg: 'bg-blue-500/10' };
        case 'comment':
            return { icon: MessageSquare, color: 'text-green-400', bg: 'bg-green-500/10' };
        case 'completion':
            return { icon: CheckCircle, color: 'text-purple-400', bg: 'bg-purple-500/10' };
        case 'alert':
            return { icon: AlertCircle, color: 'text-yellow-400', bg: 'bg-yellow-500/10' };
        default:
            return { icon: FileText, color: 'text-gray-400', bg: 'bg-gray-500/10' };
    }
};

export const RecentActivity = () => {
    const [activity, setActivity] = useState<ActivityItem[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchActivity = async () => {
            try {
                const data = await getRecentActivity();
                setActivity(data);
            } catch (error) {
                console.error("Failed to fetch recent activity", error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchActivity();
    }, []);

    if (isLoading) {
        return (
            <div className="space-y-4 animate-pulse">
                <div className="h-8 w-48 bg-gray-800 rounded mb-4"></div>
                <div className="space-y-3">
                    {[1, 2, 3].map(i => (
                        <div key={i} className="h-20 bg-gray-800/50 rounded-xl"></div>
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            <h2 className="text-xl font-bold text-white mb-4">Recent Activity</h2>

            <div className="space-y-3">
                {activity.length > 0 ? (
                    activity.map((item) => {
                        const { icon: Icon, color, bg } = getActivityIcon(item.type);

                        return (
                            <div key={item.id} className="bg-surface border border-gray-800 rounded-xl p-4 hover:border-gray-700 transition-colors flex gap-4">
                                <div className={`p-2.5 rounded-lg h-fit ${bg}`}>
                                    <Icon className={`w-5 h-5 ${color}`} />
                                </div>

                                <div className="flex-1 min-w-0">
                                    <h4 className="text-white font-medium text-sm mb-0.5">{item.title}</h4>
                                    <p className="text-gray-400 text-xs mb-1.5 truncate">{item.description}</p>
                                    <span className="text-gray-500 text-xs">{item.time}</span>
                                </div>
                            </div>
                        );
                    })
                ) : (
                    <div className="text-center py-8 text-gray-500 text-sm">
                        No recent activity.
                    </div>
                )}
            </div>

            <button className="w-full text-center text-blue-400 hover:text-blue-300 text-sm font-medium mt-2 py-2">
                View All Activity
            </button>
        </div>
    );
};
