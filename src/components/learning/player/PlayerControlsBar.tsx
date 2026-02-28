import { ChevronLeft, ChevronRight, CheckCircle } from 'lucide-react';
import type { Lesson } from '../../../hooks/useLessonPlayer';

interface PlayerControlsBarProps {
    lesson: Lesson;
    hasPrev: boolean;
    hasNext: boolean;
    onPrev: () => void;
    onNext: () => void;
    onToggleCompletion: () => void;
}

export const PlayerControlsBar = ({
    lesson,
    hasPrev,
    hasNext,
    onPrev,
    onNext,
    onToggleCompletion
}: PlayerControlsBarProps) => {
    return (
        <div className="h-16 bg-[#0B0F1A] border-t border-white/5 px-6 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-4">
                <span className="text-xs font-bold text-white truncate max-w-[200px]">
                    {lesson?.title}
                </span>
                <button
                    onClick={onToggleCompletion}
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all
                    ${lesson?.is_completed ? 'bg-green-500/20 text-green-500' : 'bg-white/5 text-gray-400 hover:text-white'}`}
                >
                    {lesson?.is_completed && <CheckCircle className="w-3.5 h-3.5" />}
                    {lesson?.is_completed ? 'Completed' : 'Complete lesson'}
                </button>
            </div>

            <div className="flex items-center gap-3">
                <button
                    disabled={!hasPrev}
                    onClick={onPrev}
                    className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-white disabled:opacity-10 hover:bg-white/10 transition-all"
                >
                    <ChevronLeft className="w-5 h-5" />
                </button>
                <button
                    disabled={!hasNext}
                    onClick={onNext}
                    className="flex items-center gap-3 px-6 h-10 bg-blue-600 hover:bg-blue-700 disabled:opacity-20 text-white rounded-xl text-[10px] font-black uppercase tracking-widest transition-all"
                >
                    Next Lesson
                    <ChevronRight className="w-4 h-4" />
                </button>
            </div>
        </div>
    );
};
