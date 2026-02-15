import type { LucideIcon } from 'lucide-react';
import { Users, FileText, Clock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export interface CourseCardProps {
    id: number;
    title: string;
    description: string;
    icon: LucideIcon;
    stats: {
        students: number;
        modules: number;
        hours: number;
    };
    progress?: number;
    status: 'active' | 'draft';
    iconColor?: string; // Optional custom color for the icon container
}

export const CourseCard = ({ id, title, description, icon: Icon, stats, progress, status }: CourseCardProps) => {
    const navigate = useNavigate();
    return (
        <div className="bg-surface border border-gray-800 rounded-xl overflow-hidden hover:border-gray-700 transition-colors flex flex-col relative">
            {status === 'draft' && (
                <div className="absolute top-3 left-3 bg-gray-700 text-gray-300 text-xs font-bold px-2 py-1 rounded">
                    Draft
                </div>
            )}

            <div className="bg-[#111827] p-8 flex justify-center items-center border-b border-gray-800">
                {/* Placeholder for course icon/image */}
                <div className={`w-16 h-16 rounded-xl flex items-center justify-center shadow-lg ${status === 'draft' ? 'bg-gray-800' : 'bg-surface'}`}>
                    <Icon className="w-8 h-8 text-blue-400" />
                </div>
            </div>

            <div className="p-6 flex-1 flex flex-col">
                <h3 className="text-lg font-bold text-white mb-2">{title}</h3>
                <p className="text-gray-400 text-sm mb-6 flex-1 line-clamp-2">
                    {description}
                </p>

                <div className="flex items-center gap-4 text-xs text-gray-400 mb-6">
                    <div className="flex items-center gap-1.5">
                        <Users className="w-3.5 h-3.5" />
                        <span>{stats.students}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                        <FileText className="w-3.5 h-3.5" />
                        <span>{stats.modules}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5" />
                        <span>{stats.hours} hours</span>
                    </div>
                </div>

                {progress !== undefined && (
                    <div className="mb-6">
                        <div className="flex justify-between text-xs mb-2">
                            <span className="text-gray-400">Course Progress</span>
                            <span className="text-blue-400 font-bold">{progress}%</span>
                        </div>
                        <div className="h-1.5 bg-gray-700 rounded-full overflow-hidden">
                            <div
                                className="h-full bg-blue-600 rounded-full"
                                style={{ width: `${progress}%` }}
                            ></div>
                        </div>
                    </div>
                )}

                <div className="flex gap-3 mt-auto">
                    <button
                        onClick={() => navigate(`/studio/${id}`)}
                        className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg text-sm font-medium transition-colors"
                    >
                        Manage
                    </button>
                    <button className="px-4 bg-[#111827] hover:bg-gray-800 text-gray-300 border border-gray-700 py-2 rounded-lg text-sm font-medium transition-colors">
                        View
                    </button>
                </div>
            </div>
        </div>
    );
};
