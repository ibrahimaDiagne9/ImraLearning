import { useState, useEffect } from 'react';
import { Video, Crown, Users, Calendar } from 'lucide-react';
import { getLiveSessions, getLeaderboard } from '../../services/api';

const UpcomingSessions = () => {
    const [sessions, setSessions] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchSessions = async () => {
            try {
                const data = await getLiveSessions();
                setSessions(Array.isArray(data) ? data.slice(0, 2) : []);
            } catch (error) {
                console.error('Failed to fetch sessions', error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchSessions();
    }, []);

    if (isLoading) return <div className="animate-pulse bg-gray-800 h-32 rounded-xl mb-6"></div>;
    if (sessions.length === 0) return null;

    return (
        <div className="bg-surface rounded-xl p-5 border border-gray-700 shadow-lg mb-6">
            <div className="flex items-center gap-2 mb-4">
                <Video className="w-5 h-5 text-primary" />
                <h3 className="font-bold text-lg">Upcoming Live Sessions</h3>
            </div>
            <div className="space-y-4">
                {sessions.map((session) => (
                    <div key={session.id} className="group cursor-pointer hover:bg-white/5 p-3 rounded-lg transition-colors border border-transparent hover:border-primary/30">
                        <div className="text-xs font-semibold text-secondary mb-1 flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {new Date(session.start_time).toLocaleDateString()} • {new Date(session.start_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </div>
                        <h4 className="font-medium mb-1 group-hover:text-primary transition-colors">{session.title}</h4>
                        <div className="flex items-center gap-2 text-sm text-gray-400">
                            <Users className="w-3 h-3" />
                            <span>{session.attendees_count || 0} attending</span>
                        </div>
                    </div>
                ))}
            </div>
            <button className="w-full mt-4 py-2 text-sm font-medium text-primary hover:text-white hover:bg-primary/10 rounded-lg transition-colors">
                View All Sessions
            </button>
        </div>
    );
};

const TopContributors = () => {
    const [contributors, setContributors] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchLeaderboard = async () => {
            try {
                const data = await getLeaderboard();
                setContributors(Array.isArray(data) ? data.slice(0, 3) : []);
            } catch (error) {
                console.error('Failed to fetch leaderboard', error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchLeaderboard();
    }, []);

    if (isLoading) return <div className="animate-pulse bg-gray-800 h-32 rounded-xl"></div>;
    if (contributors.length === 0) return null;

    return (
        <div className="bg-surface rounded-xl p-5 border border-gray-700 shadow-lg">
            <div className="flex items-center gap-2 mb-4">
                <Crown className="w-5 h-5 text-yellow-500" />
                <h3 className="font-bold text-lg">Top Contributors</h3>
            </div>
            <div className="space-y-4">
                {contributors.map((user, i) => (
                    <div key={user.id || i} className="flex items-center justify-between group cursor-pointer">
                        <div className="flex items-center gap-3">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${i === 0 ? 'bg-yellow-500 text-black' : 'bg-gray-700 text-white'
                                }`}>
                                {i + 1}
                            </div>
                            <div>
                                <div className="font-medium text-sm group-hover:text-primary transition-colors">{user.first_name || user.username}</div>
                                <div className="text-xs text-gray-400">{user.points || 0} pts</div>
                            </div>
                        </div>
                        {i === 0 && <Crown className="w-4 h-4 text-yellow-500" />}
                    </div>
                ))}
            </div>
        </div>
    );
};

export const Sidebar = () => {
    return (
        <aside className="w-80 hidden lg:block sticky top-24 h-[calc(100vh-6rem)] overflow-y-auto pr-2">
            <UpcomingSessions />
            <TopContributors />
        </aside>
    );
};
