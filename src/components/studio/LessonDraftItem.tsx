import { Play, FileText, Trash2, HelpCircle, ArrowUp, ArrowDown } from 'lucide-react';

interface LessonDraftItemProps {
    title: string;
    type: 'video' | 'article' | 'quiz' | 'assignment';
    isActive: boolean;
    onClick: () => void;
    onDelete: () => void;
    onMoveUp?: () => void;
    onMoveDown?: () => void;
}

export const LessonDraftItem = ({
    title,
    type,
    isActive,
    onClick,
    onDelete,
    onMoveUp,
    onMoveDown
}: LessonDraftItemProps) => {
    return (
        <div className="group flex items-center gap-1">
            <div className={`flex items-center gap-1 transition-all ${isActive ? 'translate-x-0' : '-translate-x-2 group-hover:translate-x-0'} opacity-0 group-hover:opacity-100`}>
                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        onMoveUp?.();
                    }}
                    className="p-1 hover:bg-white/5 rounded text-gray-700 hover:text-blue-400 transition-colors"
                >
                    <ArrowUp className="w-3 h-3" />
                </button>
                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        onMoveDown?.();
                    }}
                    className="p-1 hover:bg-white/5 rounded text-gray-700 hover:text-blue-400 transition-colors"
                >
                    <ArrowDown className="w-3 h-3" />
                </button>
            </div>

            <button
                onClick={onClick}
                className={`flex-1 flex items-center gap-3 p-3 rounded-xl transition-all ${isActive
                    ? 'bg-blue-600/10 border border-blue-500/30'
                    : 'hover:bg-white/[0.02] border border-transparent'
                    }`}
            >
                <div className={`w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 ${isActive ? 'bg-blue-600/20 text-blue-400' : 'bg-gray-800 text-gray-500'
                    }`}>
                    {type === 'video' ? <Play className="w-3 h-3" /> : type === 'quiz' ? <HelpCircle className="w-3 h-3" /> : type === 'assignment' ? <FileText className="w-3 h-3" /> : <FileText className="w-3 h-3" />}
                </div>

                <div className="flex-1 min-w-0 text-left">
                    <p className={`text-sm font-bold truncate ${isActive ? 'text-blue-400' : 'text-gray-300'}`}>
                        {title}
                    </p>
                    <p className="text-[9px] text-gray-600 font-bold uppercase tracking-widest">
                        {type === 'video' ? 'Video Lesson' : type === 'quiz' ? 'Interactive Quiz' : type === 'assignment' ? 'Assignment' : 'Article'}
                    </p>
                </div>
            </button>
            <button
                onClick={(e) => {
                    e.stopPropagation();
                    if (window.confirm('Delete this lesson?')) {
                        onDelete();
                    }
                }}
                className="p-2 text-gray-700 hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100"
            >
                <Trash2 className="w-3.5 h-3.5" />
            </button>
        </div>
    );
};
