import { useState } from 'react';
import type { LucideIcon } from 'lucide-react';
import { Users, Clock, Star, ChevronDown, ChevronUp, BookOpen, PlayCircle, FileText, CheckSquare, HelpCircle, Sparkles, Trophy } from 'lucide-react';

export interface StudentCourseCardProps {
    id: number;
    title: string;
    instructor: string;
    description: string;
    icon: LucideIcon;
    stats: {
        students: number;
        rating: number;
        hours: number;
    };
    level: 'Beginner' | 'Intermediate' | 'Advanced';
    price: string;
    isEnrolled: boolean;
    sections?: any[];
    onEnroll?: (id: number) => void;
    onContinue?: (id: number) => void;
    isFeatured?: boolean;
}

export const StudentCourseCard = ({
    id,
    title,
    instructor,
    description,
    icon: Icon,
    stats,
    level,
    price,
    isEnrolled,
    sections = [],
    onEnroll,
    onContinue,
    isFeatured = false
}: StudentCourseCardProps) => {
    const [isCurriculumOpen, setIsCurriculumOpen] = useState(false);

    const getLessonIcon = (type: string) => {
        switch (type) {
            case 'video': return PlayCircle;
            case 'article': return FileText;
            case 'quiz': return HelpCircle;
            case 'assignment': return CheckSquare;
            default: return BookOpen;
        }
    };

    return (
        <div className={`group relative bg-[#0B0F1A]/60 backdrop-blur-xl border border-white/5 rounded-[2.5rem] overflow-hidden hover:border-blue-500/30 transition-all duration-500 flex flex-col h-fit shadow-2xl ${isFeatured ? 'ring-1 ring-blue-500/20' : ''}`}>
            {/* Glossy Overlay */}
            <div className="absolute inset-0 bg-gradient-to-tr from-white/[0.02] to-transparent pointer-events-none" />

            {/* Card Header/Icon Area */}
            <div className={`relative p-8 flex flex-col items-center justify-center border-b border-white/5 overflow-hidden ${isFeatured ? 'bg-blue-600/5' : 'bg-white/[0.02]'}`}>
                {/* Decorative Circles */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full blur-3xl -mr-16 -mt-16" />
                <div className="absolute bottom-0 left-0 w-24 h-24 bg-indigo-500/10 rounded-full blur-2xl -ml-12 -mb-12" />

                <div className="absolute top-5 inset-x-6 flex justify-between items-center">
                    {isFeatured && (
                        <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/20 border border-blue-500/30 text-blue-400 text-[10px] font-black uppercase tracking-widest">
                            <Trophy className="w-3 h-3" />
                            Featured
                        </div>
                    )}
                    {!isFeatured && isEnrolled && (
                        <div className="px-3 py-1 rounded-full bg-green-500/10 border border-green-500/20 text-green-400 text-[10px] font-black uppercase tracking-widest">
                            In Progress
                        </div>
                    )}
                    <div className="ml-auto px-3 py-1 rounded-full bg-white/5 border border-white/10 text-gray-400 text-[10px] font-black uppercase tracking-widest">
                        {level}
                    </div>
                </div>

                <div className="relative z-10 w-20 h-20 rounded-3xl bg-gradient-to-br from-gray-800 to-gray-900 border border-white/10 flex items-center justify-center shadow-2xl group-hover:scale-110 group-hover:rotate-3 transition-all duration-500">
                    <Icon className="w-10 h-10 text-blue-400 drop-shadow-[0_0_15px_rgba(59,130,246,0.5)]" />
                </div>
            </div>

            {/* Content Body */}
            <div className="p-8 flex-1 flex flex-col relative z-10">
                <div className="mb-6">
                    <div className="flex items-center gap-2 mb-2">
                        <span className="text-[10px] font-black text-blue-500 uppercase tracking-widest">{instructor}</span>
                        <div className="w-1 h-1 rounded-full bg-gray-800" />
                        <span className="text-[10px] font-medium text-gray-500">Industry Expert</span>
                    </div>
                    <h3 className="text-xl font-black text-white mb-3 group-hover:text-blue-400 transition-colors line-clamp-2 leading-tight">
                        {title}
                    </h3>
                    <p className="text-gray-400 text-sm font-medium line-clamp-2 leading-relaxed h-10 mb-2">
                        {description}
                    </p>
                </div>

                <div className="grid grid-cols-3 gap-2 py-5 border-y border-white/5 mb-4">
                    <div className="flex flex-col items-center gap-1 px-2">
                        <Star className="w-4 h-4 text-yellow-500 fill-current" />
                        <span className="text-xs font-black text-white">{stats.rating}</span>
                        <span className="text-[9px] font-bold text-gray-600 uppercase tracking-tighter">Rating</span>
                    </div>
                    <div className="flex flex-col items-center gap-1 px-2 border-x border-white/5">
                        <Users className="w-4 h-4 text-blue-400" />
                        <span className="text-xs font-black text-white">{stats.students}</span>
                        <span className="text-[9px] font-bold text-gray-600 uppercase tracking-tighter">Students</span>
                    </div>
                    <div className="flex flex-col items-center gap-1 px-2">
                        <Clock className="w-4 h-4 text-purple-400" />
                        <span className="text-xs font-black text-white">{stats.hours}h</span>
                        <span className="text-[9px] font-bold text-gray-600 uppercase tracking-tighter">Duration</span>
                    </div>
                </div>

                {/* Curriculum Toggle */}
                <button
                    onClick={() => setIsCurriculumOpen(!isCurriculumOpen)}
                    className="flex items-center justify-between w-full py-4 text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] hover:text-blue-400 transition-colors"
                >
                    Curriculum Reveal
                    {isCurriculumOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </button>

                {isCurriculumOpen && (
                    <div className="space-y-5 mb-6 animate-in fade-in slide-in-from-top-4 duration-500">
                        {sections.length > 0 ? (
                            sections.map((section, idx) => (
                                <div key={section.id || idx} className="space-y-3">
                                    <div className="flex items-center gap-2">
                                        <div className="w-1.5 h-1.5 rounded-full bg-blue-500/50" />
                                        <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{section.title}</h4>
                                    </div>
                                    <div className="space-y-2 pl-3">
                                        {(section.lessons || []).slice(0, 3).map((lesson: any, lIdx: number) => {
                                            const LessonIcon = getLessonIcon(lesson.lesson_type);
                                            return (
                                                <div key={lesson.id || lIdx} className="flex items-center gap-3 p-3 rounded-2xl bg-white/[0.02] border border-white/5 group/lesson hover:bg-white/[0.05] transition-all">
                                                    <div className="w-8 h-8 rounded-xl bg-gray-900 flex items-center justify-center border border-white/5 group-hover/lesson:border-blue-500/50 transition-colors">
                                                        <LessonIcon className="w-3.5 h-3.5 text-gray-500" />
                                                    </div>
                                                    <span className="text-xs font-medium text-gray-400 truncate flex-1">{lesson.title}</span>
                                                    {lesson.is_preview && (
                                                        <span className="text-[9px] font-black text-blue-500 uppercase tracking-widest px-1.5 py-0.5 rounded bg-blue-500/10">Free</span>
                                                    )}
                                                </div>
                                            );
                                        })}
                                        {section.lessons?.length > 3 && (
                                            <p className="text-[10px] font-bold text-gray-600 uppercase tracking-widest pl-3">+ {section.lessons.length - 3} more lessons</p>
                                        )}
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="flex flex-col items-center py-4 bg-white/[0.02] rounded-3xl border border-white/5">
                                <Sparkles className="w-5 h-5 text-gray-700 mb-2" />
                                <p className="text-xs text-gray-600 font-bold uppercase tracking-widest text-center">Modules coming soon</p>
                            </div>
                        )}
                    </div>
                )}

                {/* Pricing & CTA */}
                <div className="flex items-center justify-between pt-6 mt-auto border-t border-white/5">
                    <div className="flex flex-col">
                        <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Pricing</span>
                        <span className="text-2xl font-black text-white leading-none">
                            {price === 'Free' ? (
                                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-400">Gratuit</span>
                            ) : price}
                        </span>
                    </div>

                    <button
                        onClick={() => isEnrolled ? onContinue?.(id) : onEnroll?.(id)}
                        className={`relative group/btn overflow-hidden px-8 py-3.5 rounded-2xl font-black text-xs uppercase tracking-widest transition-all duration-300 active:scale-95 ${isEnrolled
                            ? 'bg-white/5 text-blue-400 border border-white/10 hover:bg-white/10'
                            : 'bg-blue-600 text-white shadow-[0_10px_30px_rgba(37,99,235,0.3)] hover:shadow-[0_15px_40px_rgba(37,99,235,0.4)]'
                            }`}
                    >
                        {/* Shimmer Effect */}
                        {!isEnrolled && (
                            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover/btn:translate-x-full transition-transform duration-1000" />
                        )}
                        <span className="relative z-10">{isEnrolled ? 'Continue' : 'Begin Journey'}</span>
                    </button>
                </div>
            </div>
        </div>
    );
};
