import { Play, Star, Clock, Users, FileText, Award } from 'lucide-react';

interface CourseHeaderProps {
    course: any;
    onContinue: () => void;
    progress: number;
}

export const CourseHeader = ({ course, onContinue, progress }: CourseHeaderProps) => {
    return (
        <div className="bg-[#0B0F1A] border-b border-white/5 p-8 rounded-3xl mb-8 relative overflow-hidden group">
            {/* Background Glow */}
            <div className="absolute top-0 right-0 w-1/2 h-full bg-blue-600/5 blur-[100px] rounded-full pointer-events-none" />

            <div className="relative z-10 flex flex-col lg:flex-row gap-8 justify-between items-start">
                <div className="flex-1 space-y-6">
                    <div className="flex items-center gap-3">
                        <span className="px-3 py-1 rounded-full bg-blue-600 text-[10px] font-black uppercase tracking-widest text-white">
                            {course.level || 'All Levels'}
                        </span>
                        {course.rating && (
                            <div className="flex items-center gap-1 text-yellow-500">
                                <Star className="w-4 h-4 fill-current" />
                                <span className="text-sm font-bold text-white">{course.rating}</span>
                                <span className="text-xs text-gray-500 font-medium">({course.students_count || 0} students)</span>
                            </div>
                        )}
                    </div>

                    <div>
                        <h1 className="text-4xl font-black text-white mb-2 tracking-tight">{course.title}</h1>
                        <p className="text-gray-400 font-medium text-lg max-w-2xl">{course.subtitle}</p>
                    </div>

                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 p-0.5">
                            <div className="w-full h-full rounded-[14px] bg-[#0B0F1A] flex items-center justify-center overflow-hidden">
                                {course.instructor_image ? (
                                    <img src={course.instructor_image} alt={course.instructor_name} className="w-full h-full object-cover" />
                                ) : (
                                    <span className="text-lg font-black text-white">{course.instructor_name?.[0] || 'I'}</span>
                                )}
                            </div>
                        </div>
                        <div>
                            <p className="text-[10px] text-gray-500 uppercase font-black tracking-widest">Instructor</p>
                            <p className="text-white font-bold">{course.instructor_name || 'Instructor'}</p>
                        </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-6 text-sm text-gray-400 font-medium">
                        {course.duration && (
                            <div className="flex items-center gap-2">
                                <Clock className="w-4 h-4" />
                                <span>{course.duration}</span>
                            </div>
                        )}
                        <div className="flex items-center gap-2">
                            <Users className="w-4 h-4" />
                            <span>{course.students_count || 0} students</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <FileText className="w-4 h-4" />
                            <span>{course.sections?.reduce((acc: number, s: any) => acc + (s.lessons?.length || 0), 0) || 0} lessons</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <Award className="w-4 h-4" />
                            <span>Certificate of completion</span>
                        </div>
                    </div>
                </div>

                {/* Right Side Card */}
                <div className="w-full lg:w-96 bg-[#131722] rounded-3xl p-6 border border-white/5 shadow-xl">
                    <div className="aspect-video bg-blue-900/20 rounded-2xl mb-6 flex items-center justify-center relative overflow-hidden">
                        {course.thumbnail ? (
                            <img src={course.thumbnail} alt={course.title} className="w-full h-full object-cover opacity-80" />
                        ) : (
                            <div className="w-16 h-16 rounded-2xl bg-white/10 flex items-center justify-center backdrop-blur-xl">
                                <Play className="w-8 h-8 text-white ml-1" />
                            </div>
                        )}
                    </div>

                    <div className="space-y-4">
                        <div className="flex justify-between items-end mb-2">
                            <span className="text-xs text-gray-400 font-medium">Your Progress</span>
                            <span className="text-xs text-blue-400 font-black">{Math.round(progress)}%</span>
                        </div>
                        <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
                            <div
                                className="h-full bg-blue-600 rounded-full transition-all duration-1000"
                                style={{ width: `${progress}%` }}
                            />
                        </div>
                        <p className="text-xs text-gray-500 font-medium text-right">
                            {course.completed_lessons_count || 0} of {course.total_lessons_count || course.sections?.reduce((acc: number, s: any) => acc + (s.lessons?.length || 0), 0) || 0} lessons completed
                        </p>

                        <button
                            onClick={onContinue}
                            className="w-full h-12 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-black uppercase tracking-widest text-xs transition-all flex items-center justify-center gap-2 shadow-lg shadow-blue-600/20 hover:scale-[1.02] active:scale-[0.98]"
                        >
                            <Play className="w-4 h-4 fill-current" />
                            Continue Learning
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};
