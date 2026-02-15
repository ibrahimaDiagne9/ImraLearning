import { useState, useEffect } from 'react';
import { FileText, MessageSquare, AlertCircle, ArrowRight, Clock } from 'lucide-react';
import { getPendingTasks } from '../../services/api';

interface TaskItem {
    id: string;
    title: string;
    description: string;
    type: 'grading' | 'community' | 'setup';
    urgency: 'high' | 'medium' | 'low';
    time: string;
}

export const PendingTasks = () => {
    const [tasks, setTasks] = useState<TaskItem[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchTasks = async () => {
            try {
                const data = await getPendingTasks();
                setTasks(data);
            } catch (error) {
                console.error("Failed to fetch pending tasks", error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchTasks();
    }, []);

    if (isLoading) {
        return (
            <div className="bg-[#111827] border border-gray-800 rounded-2xl p-6 lg:p-8 animate-pulse">
                <div className="h-6 w-48 bg-gray-800 rounded mb-4"></div>
                <div className="space-y-4">
                    <div className="h-20 bg-gray-800/50 rounded-xl"></div>
                    <div className="h-20 bg-gray-800/50 rounded-xl"></div>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-[#111827] border border-gray-800 rounded-2xl p-6 lg:p-8">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h3 className="text-xl font-bold text-white mb-1">Needs Your Attention</h3>
                    <p className="text-sm text-gray-400">Critical items requiring action</p>
                </div>
                <div className="flex items-center gap-2 px-3 py-1 bg-amber-500/10 border border-amber-500/20 rounded-full">
                    <AlertCircle className="w-4 h-4 text-amber-500" />
                    <span className="text-xs font-bold text-amber-500 uppercase tracking-wider">{tasks.length} Pending</span>
                </div>
            </div>

            <div className="space-y-4">
                {tasks.length > 0 ? (
                    tasks.map((task) => (
                        <div
                            key={task.id}
                            className="group relative bg-[#1F2937]/30 hover:bg-[#1F2937]/50 border border-gray-800/50 hover:border-blue-500/30 rounded-xl p-4 transition-all duration-300"
                        >
                            <div className="flex items-start gap-4">
                                <div className={`p-3 rounded-lg ${task.type === 'grading' ? 'bg-blue-500/10 text-blue-400' :
                                    task.type === 'community' ? 'bg-purple-500/10 text-purple-400' :
                                        'bg-orange-500/10 text-orange-400'
                                    }`}>
                                    {task.type === 'grading' && <FileText className="w-5 h-5" />}
                                    {task.type === 'community' && <MessageSquare className="w-5 h-5" />}
                                    {task.type === 'setup' && <Clock className="w-5 h-5" />}
                                </div>

                                <div className="flex-grow min-w-0">
                                    <div className="flex items-center gap-2 mb-1">
                                        <h4 className="text-sm font-bold text-white truncate">{task.title}</h4>
                                        <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded uppercase tracking-tighter ${task.urgency === 'high' ? 'bg-red-500/10 text-red-500' :
                                            task.urgency === 'medium' ? 'bg-amber-500/10 text-amber-500' :
                                                'bg-blue-500/10 text-blue-500'
                                            }`}>
                                            {task.urgency}
                                        </span>
                                    </div>
                                    <p className="text-xs text-gray-400 line-clamp-1 mb-2">{task.description}</p>
                                    <div className="flex items-center gap-4">
                                        <span className="text-[10px] text-gray-500 flex items-center gap-1">
                                            <Clock className="w-3 h-3" />
                                            {task.time}
                                        </span>
                                    </div>
                                </div>

                                <button className="self-center p-2 rounded-lg bg-blue-600/10 text-blue-400 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-blue-600 hover:text-white">
                                    <ArrowRight className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="text-center py-8 text-gray-500 text-sm">
                        No pending tasks. You're all caught up!
                    </div>
                )}
            </div>

            <button className="w-full mt-8 py-3 rounded-xl border border-dashed border-gray-800 text-gray-500 hover:text-white hover:border-blue-500/50 hover:bg-blue-500/5 transition-all text-sm font-medium">
                View All Tasks
            </button>
        </div>
    );
};
