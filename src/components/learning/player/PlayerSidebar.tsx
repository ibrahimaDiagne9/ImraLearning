import { CheckCircle, Clock } from 'lucide-react';
import type { Course } from '../../../hooks/useLessonPlayer';

interface PlayerSidebarProps {
    course: Course;
    activeLessonId: number | null;
    setActiveLessonId: (id: number) => void;
    isOpen: boolean;
    onPlay: () => void;
}

export const PlayerSidebar = ({
    course,
    activeLessonId,
    setActiveLessonId,
    isOpen,
    onPlay
}: PlayerSidebarProps) => {
    return (
        <aside
            className={`flex-shrink-0 bg-[#0B0F1A] border-r border-white/5 transition-all duration-300 flex flex-col
            ${isOpen ? 'w-80' : 'w-0 overflow-hidden'}`}
        >
            <div className="p-6 h-20 flex items-center justify-between border-b border-white/5 whitespace-nowrap">
                <h3 className="text-xs font-black text-blue-500 uppercase tracking-widest">PROGRAM FLOW</h3>
            </div>

            <div className="flex-1 overflow-y-auto custom-scrollbar-hidden p-2">
                {course.sections?.map((section) => (
                    <div key={section.id} className="mb-6">
                        <div className="px-4 py-2">
                            <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">
                                {section.title || "UNTITLED SECTION"}
                            </span>
                        </div>
                        {section.lessons?.map((lesson, i) => (
                            <button
                                key={lesson.id}
                                onClick={() => {
                                    setActiveLessonId(lesson.id);
                                    onPlay();
                                }}
                                className={`w-full flex items-center gap-4 p-4 rounded-xl text-left transition-all group
                                ${activeLessonId === lesson.id ? 'bg-blue-600/10' : 'hover:bg-white/5'}`}
                            >
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-[10px] font-bold transition-all
                                    ${lesson.is_completed ? 'bg-green-500/20 text-green-500' :
                                        activeLessonId === lesson.id ? 'bg-blue-600 text-white' : 'bg-gray-800 text-gray-400'}`}>
                                    {lesson.is_completed ? <CheckCircle className="w-4 h-4" /> : i + 1}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h4 className={`text-xs font-bold truncate ${activeLessonId === lesson.id ? 'text-white' : 'text-gray-400'}`}>
                                        {lesson.title}
                                    </h4>
                                    <div className="flex items-center gap-2 mt-1 opacity-40">
                                        <span className="text-[9px] font-bold uppercase tracking-widest flex items-center gap-1">
                                            <Clock className="w-3 h-3" /> {lesson.duration || '0M'}
                                        </span>
                                    </div>
                                </div>
                                {activeLessonId === lesson.id && (
                                    <div className="w-1.5 h-1.5 rounded-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.6)]" />
                                )}
                            </button>
                        ))}
                    </div>
                ))}
            </div>

            <div className="p-6 bg-black/20 border-t border-white/5">
                <div className="flex justify-between text-[10px] font-bold uppercase text-gray-500 mb-2">
                    <span>Course progress</span>
                    <span className="text-white">{Math.round(course.progress_percentage || 0)}%</span>
                </div>
                <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                    <div
                        className="h-full bg-blue-600 rounded-full transition-all duration-1000"
                        style={{ width: `${course.progress_percentage || 0}%` }}
                    />
                </div>
            </div>
        </aside>
    );
};
