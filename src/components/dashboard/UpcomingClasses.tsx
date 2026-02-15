import { useState, useEffect } from 'react';
import { Video, Clock, Users } from 'lucide-react';
import { getUpcomingClasses } from '../../services/api';

interface ClassItem {
    id: number;
    title: string;
    course: string;
    time: string;
    duration: string;
    students: number;
    isLive?: boolean;
    date?: string;
}

export const UpcomingClasses = () => {
    const [classes, setClasses] = useState<ClassItem[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchClasses = async () => {
            try {
                const data = await getUpcomingClasses();
                setClasses(data);
            } catch (error) {
                console.error("Failed to fetch upcoming classes", error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchClasses();
    }, []);

    if (isLoading) {
        return (
            <div className="space-y-4 animate-pulse">
                <div className="h-8 w-48 bg-gray-800 rounded"></div>
                <div className="h-32 bg-gray-800/50 rounded-xl"></div>
                <div className="h-32 bg-gray-800/50 rounded-xl"></div>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            <h2 className="text-xl font-bold text-white mb-4">Upcoming Classes</h2>

            {classes.length > 0 ? (
                classes.map((item) => (
                    <div key={item.id} className="bg-surface border border-gray-800 rounded-xl p-5 hover:border-gray-700 transition-colors">
                        <div className="flex items-start justify-between mb-4">
                            <div>
                                <div className="flex items-center gap-3 mb-1">
                                    {item.isLive && (
                                        <span className="bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded flex items-center gap-1">
                                            <span className="w-1.5 h-1.5 bg-white rounded-full animate-pulse"></span>
                                            LIVE
                                        </span>
                                    )}
                                    <h3 className="font-bold text-white text-lg">{item.title}</h3>
                                </div>
                                <div className="text-blue-400 text-sm font-medium mb-3">{item.course}</div>

                                <div className="flex items-center gap-4 text-gray-400 text-sm">
                                    <div className="flex items-center gap-1.5">
                                        <Clock className="w-4 h-4" />
                                        <span>{item.date ? item.date + ' ' : ''}{item.time}</span>
                                    </div>
                                    <div className="flex items-center gap-1.5">
                                        <Video className="w-4 h-4" />
                                        <span>{item.duration}</span>
                                    </div>
                                    <div className="flex items-center gap-1.5">
                                        <Users className="w-4 h-4" />
                                        <span>{item.students}</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <button className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg font-medium transition-colors text-sm">
                            View Details
                        </button>
                    </div>
                ))
            ) : (
                <div className="text-center py-8 text-gray-500 text-sm bg-surface border border-gray-800 rounded-xl">
                    No upcoming classes scheduled.
                </div>
            )}
        </div>
    );
};
