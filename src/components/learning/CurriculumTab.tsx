import { Play, CheckCircle, Lock, Award, FileText } from 'lucide-react';

interface CurriculumTabProps {
    course: any;
    onPlayLesson: (lessonId: number) => void;
}

export const CurriculumTab = ({ course, onPlayLesson }: CurriculumTabProps) => {
    return (
        <div className="space-y-6 max-w-5xl animate-in fade-in slide-in-from-bottom-4 duration-500">
            {course.sections?.map((section: any) => (
                <div key={section.id} className="bg-[#0B0F1A] border border-white/5 rounded-3xl overflow-hidden">
                    <div className="px-8 py-6 border-b border-white/5 bg-white/[0.02]">
                        <h3 className="font-bold text-white text-sm">{section.title}</h3>
                        <p className="text-xs text-gray-500 mt-1 font-medium">{section.lessons?.length || 0} lessons</p>
                    </div>
                    <div>
                        {section.lessons?.map((lesson: any) => {
                            const isLocked = !lesson.is_accessible && !lesson.is_completed; // simplified logic

                            return (
                                <div
                                    key={lesson.id}
                                    className="px-8 py-5 border-b border-white/5 last:border-0 flex items-center justify-between group hover:bg-white/[0.02] transition-colors"
                                >
                                    <div className="flex items-center gap-4">
                                        <div className={`w-6 h-6 rounded-full flex items-center justify-center border
                                            ${lesson.is_completed
                                                ? 'bg-green-500/10 border-green-500/20 text-green-500'
                                                : isLocked
                                                    ? 'bg-white/5 border-white/10 text-gray-500'
                                                    : 'bg-blue-500/10 border-blue-500/20 text-blue-500'
                                            }`}
                                        >
                                            {lesson.is_completed ? (
                                                <CheckCircle className="w-3.5 h-3.5" />
                                            ) : isLocked ? (
                                                <Lock className="w-3.5 h-3.5" />
                                            ) : lesson.lesson_type === 'quiz' ? (
                                                <Award className="w-3.5 h-3.5" />
                                            ) : lesson.lesson_type === 'assignment' ? (
                                                <FileText className="w-3.5 h-3.5" />
                                            ) : (
                                                <Play className="w-3.5 h-3.5 fill-current" />
                                            )}
                                        </div>
                                        <div>
                                            <p className={`text-sm font-bold ${lesson.is_completed ? 'text-gray-400' : 'text-white'}`}>
                                                {lesson.title}
                                            </p>
                                            <p className="text-xs text-gray-500 mt-0.5">{lesson.duration || '0:00'}</p>
                                        </div>
                                    </div>

                                    {!isLocked && (
                                        <button
                                            onClick={() => onPlayLesson(lesson.id)}
                                            className="text-xs font-black uppercase tracking-widest text-blue-500 hover:text-white transition-colors opacity-0 group-hover:opacity-100"
                                        >
                                            {lesson.lesson_type === 'quiz' ? 'Take Quiz' : lesson.lesson_type === 'assignment' ? 'Start' : 'Watch'}
                                        </button>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>
            ))}
        </div>
    );
};
