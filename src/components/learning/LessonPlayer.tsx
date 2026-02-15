import { useState, useEffect } from 'react';
import {
    CheckCircle, ChevronLeft, ChevronRight,
    Clock, Sparkles, Maximize2, Minimize2, Menu, X, MessageSquare, Info,
    Upload, FileText, Download
} from 'lucide-react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import api, { submitAssignment } from '../../services/api';
import { QuizComponent } from './QuizComponent';
import { CourseHeader } from './CourseHeader';
import { CourseTabs } from './CourseTabs';
import { OverviewTab } from './OverviewTab';
import { CurriculumTab } from './CurriculumTab';
import { ResourcesTab } from './ResourcesTab';


export const LessonPlayer = ({ onBack }: { onBack: () => void }) => {
    const { courseId } = useParams();
    const navigate = useNavigate();
    const location = useLocation();
    const [course, setCourse] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [viewMode, setViewMode] = useState<'dashboard' | 'learning'>('dashboard');

    // Player State
    const [isCinemaMode, setIsCinemaMode] = useState(true);
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const [activeLessonId, setActiveLessonId] = useState<number | null>(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [activeTab, setActiveTab] = useState<'overview' | 'resources' | 'quiz' | 'assignment'>('overview');

    // Dashboard Tabs
    const [dashboardTab, setDashboardTab] = useState('overview');

    // Assignment Submission State
    const [submissionContent, setSubmissionContent] = useState('');
    const [submissionFile, setSubmissionFile] = useState<File | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        if (courseId) fetchCourse();
    }, [courseId]);

    const fetchCourse = async () => {
        setIsLoading(true);
        try {
            const response = await api.get(`/courses/${courseId}/`);
            setCourse(response.data);
            if (response.data.sections?.[0]?.lessons?.[0]) {
                setActiveLessonId(response.data.sections[0].lessons[0].id);
            }
        } catch (error) {
            console.error('Failed to fetch course', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleBack = () => {
        if (viewMode === 'learning') {
            setViewMode('dashboard');
        } else {
            if (location.state?.fromStudio) navigate(-1);
            else onBack();
        }
    };

    const handlePlayLesson = (lessonId: number) => {
        setActiveLessonId(lessonId);
        setViewMode('learning');
        setIsPlaying(true);
    };

    if (isLoading) {
        return (
            <div className="h-screen bg-[#03060E] flex items-center justify-center">
                <div className="relative">
                    <div className="w-20 h-20 border-4 border-blue-500/10 border-t-blue-500 rounded-full animate-spin" />
                    <Sparkles className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 text-blue-400 animate-pulse" />
                </div>
            </div>
        );
    }

    if (!course) return null;

    const allLessons = (course.sections || []).flatMap((s: any) => s.lessons);
    const activeLesson = allLessons.find((l: any) => l.id === activeLessonId) || allLessons[0];
    const lessonIndex = allLessons.findIndex((l: any) => l.id === activeLessonId);

    const handleToggleCompletion = async () => {
        if (!activeLessonId) return;
        try {
            const data = await api.post(`/lessons/${activeLessonId}/toggle-completion/`);
            setCourse((prev: any) => ({
                ...prev,
                sections: prev.sections.map((s: any) => ({
                    ...s,
                    lessons: s.lessons.map((l: any) =>
                        l.id === activeLessonId ? { ...l, is_completed: data.data.is_completed } : l
                    )
                }))
            }));
        } catch (error) {
            console.error('Toggle completion failed', error);
        }
    };

    if (viewMode === 'dashboard') {
        return (
            <div className="min-h-screen bg-[#03060E] text-white font-sans">
                <div className="max-w-7xl mx-auto px-6 py-8">
                    <button
                        onClick={() => onBack()}
                        className="flex items-center gap-2 text-sm font-bold text-gray-500 hover:text-white transition-colors mb-8"
                    >
                        <ChevronLeft className="w-4 h-4" />
                        Back to Courses
                    </button>

                    <CourseHeader
                        course={course}
                        onContinue={() => setViewMode('learning')}
                        progress={course.progress_percentage || 0}
                    />

                    <CourseTabs activeTab={dashboardTab} setActiveTab={setDashboardTab} />

                    <div className="min-h-[400px]">
                        {dashboardTab === 'overview' && <OverviewTab course={course} />}
                        {dashboardTab === 'curriculum' && <CurriculumTab course={course} onPlayLesson={handlePlayLesson} />}
                        {dashboardTab === 'discussions' && (
                            <div className="bg-[#0B0F1A] border border-white/5 rounded-3xl p-8 min-h-[400px]">
                                {/* Reuse Discussions Page logic or implement a simplified version */}
                                <div className="text-center py-20">
                                    <MessageSquare className="w-12 h-12 text-gray-600 mx-auto mb-4" />
                                    <h3 className="text-lg font-bold text-white mb-2">Course Discussions</h3>
                                    <p className="text-gray-500 mb-6">Join the community and ask questions.</p>
                                    <button
                                        onClick={() => navigate('/discussions')}
                                        className="px-6 py-3 rounded-xl bg-blue-600 text-white font-black uppercase text-xs tracking-widest hover:bg-blue-700 transition-colors"
                                    >
                                        Go to Discussions Board
                                    </button>
                                </div>
                            </div>
                        )}
                        {dashboardTab === 'resources' && <ResourcesTab course={course} />}
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="h-screen bg-[#03060E] text-white flex overflow-hidden font-sans">
            {/* Sidebar - Retractable Glass */}
            <aside
                className={`fixed lg:relative z-50 h-full bg-[#0B0F1A]/80 backdrop-blur-2xl border-r border-white/5 transition-all duration-500 ease-in-out flex flex-col shadow-2xl
                ${isSidebarOpen ? 'w-full md:w-80 translate-x-0' : 'w-0 -translate-x-full lg:translate-x-0 lg:w-0 overflow-hidden opacity-0'}`}
            >
                <div className="p-6 h-20 flex items-center justify-between border-b border-white/5 bg-white/[0.02]">
                    <h3 className="text-xs font-black uppercase tracking-[0.2em] text-blue-500">Program Flow</h3>
                    <button onClick={() => setIsSidebarOpen(false)} className="lg:hidden p-2 hover:bg-white/5 rounded-xl">
                        <X className="w-5 h-5 text-gray-500" />
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto custom-scrollbar pt-2">
                    {course.sections?.map((section: any) => (
                        <div key={section.id}>
                            <div className="px-6 py-4 text-[10px] font-black text-gray-500 uppercase tracking-widest bg-white/[0.01] border-y border-white/5">
                                {section.title}
                            </div>
                            {section.lessons?.map((lesson: any, i: number) => (
                                <button
                                    key={lesson.id}
                                    onClick={() => {
                                        setActiveLessonId(lesson.id);
                                        setIsPlaying(false);
                                        if (window.innerWidth < 1024) setIsSidebarOpen(false);
                                    }}
                                    className={`w-full flex items-start gap-4 p-5 text-left transition-all border-l-2 relative group
                                    ${activeLessonId === lesson.id ? 'bg-blue-600/10 border-blue-500' : 'border-transparent hover:bg-white/5'}`}
                                >
                                    <div className={`mt-1 w-6 h-6 rounded-xl flex items-center justify-center text-[10px] font-black transition-all
                                        ${lesson.is_completed ? 'bg-green-500/20 text-green-400' :
                                            activeLessonId === lesson.id ? 'bg-blue-600 text-white' : 'bg-white/5 text-gray-600'}`}>
                                        {lesson.is_completed ? <CheckCircle className="w-3.5 h-3.5" /> : i + 1}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <h4 className={`text-sm font-bold truncate ${activeLessonId === lesson.id ? 'text-white' : 'text-gray-400'}`}>
                                            {lesson.title}
                                        </h4>
                                        <div className="flex items-center gap-3 mt-1 opacity-60">
                                            <span className="text-[10px] font-black uppercase tracking-tighter flex items-center gap-1">
                                                <Clock className="w-3 h-3" /> {lesson.duration || '0m'}
                                            </span>
                                        </div>
                                    </div>
                                    {activeLessonId === lesson.id && (
                                        <div className="absolute right-4 top-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,1)] animate-pulse" />
                                    )}
                                </button>
                            ))}
                        </div>
                    ))}
                </div>

                <div className="p-6 bg-white/[0.02] border-t border-white/5">
                    <div className="mb-4">
                        <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-gray-500 mb-2">
                            <span>Your Growth</span>
                            <span>{Math.round(course.progress_percentage || 0)}%</span>
                        </div>
                        <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                            <div
                                className="h-full bg-gradient-to-r from-blue-600 to-indigo-500 transition-all duration-1000"
                                style={{ width: `${course.progress_percentage || 0}%` }}
                            />
                        </div>
                    </div>
                </div>
            </aside>

            {/* Main Area */}
            <main className="flex-1 flex flex-col relative min-w-0">
                {/* Floating Header */}
                <header className="absolute top-0 inset-x-0 z-40 h-20 px-8 flex items-center justify-between pointer-events-none">
                    <div className="flex items-center gap-4 pointer-events-auto">
                        <button
                            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                            className="w-12 h-12 rounded-2xl bg-[#0B0F1A]/80 backdrop-blur-xl border border-white/10 flex items-center justify-center hover:scale-105 transition-transform"
                        >
                            <Menu className="w-5 h-5" />
                        </button>
                        <div className="hidden md:flex flex-col px-4 py-2 rounded-2xl bg-[#0B0F1A]/80 backdrop-blur-xl border border-white/10">
                            <h2 className="text-xs font-black uppercase tracking-widest text-blue-400">Mastery Course</h2>
                            <p className="text-sm font-bold truncate max-w-[200px]">{course.title}</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-3 pointer-events-auto">
                        <button
                            onClick={handleBack}
                            className="px-5 py-2.5 rounded-2xl bg-[#0B0F1A]/80 backdrop-blur-xl border border-white/10 text-xs font-black uppercase tracking-widest hover:bg-white/5 transition-all"
                        >
                            Exit
                        </button>
                    </div>
                </header>

                {/* Content Container */}
                <div className={`flex-1 overflow-y-auto custom-scrollbar transition-all duration-500 ${isCinemaMode ? 'bg-black' : 'bg-[#03060E] p-8 mt-20'}`}>
                    {/* Lesson Renderer */}
                    <div className={`${isCinemaMode ? 'h-full flex flex-col' : 'max-w-6xl mx-auto'}`}>
                        {activeLesson?.lesson_type === 'video' ? (
                            <div className={`relative ${isCinemaMode ? 'flex-1' : 'aspect-video rounded-[3rem] overflow-hidden shadow-2xl shadow-blue-500/10'}`}>
                                <video
                                    src={activeLesson.video_file || activeLesson.video_url}
                                    controls
                                    className="w-full h-full object-contain"
                                    onPlay={() => setIsPlaying(true)}
                                />
                                {!isPlaying && !isCinemaMode && (
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex flex-col justify-end p-12">
                                        <h1 className="text-4xl font-black mb-2">{activeLesson.title}</h1>
                                        <p className="text-gray-400 font-medium">Click to unlock this experience</p>
                                    </div>
                                )}
                            </div>
                        ) : activeLesson?.lesson_type === 'assignment' ? (
                            <div className="flex-1 flex flex-col justify-center items-center p-12 lg:p-24 overflow-y-auto">
                                <div className="max-w-3xl w-full space-y-8">
                                    <div className="inline-flex items-center gap-3 px-4 py-2 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-[10px] font-black uppercase tracking-widest">
                                        <FileText className="w-4 h-4" /> Challenge Ahead
                                    </div>
                                    <h1 className="text-5xl lg:text-7xl font-black tracking-tight leading-tight">{activeLesson.title}</h1>
                                    <div className="p-8 lg:p-12 rounded-[3rem] bg-white/[0.02] border border-white/5 backdrop-blur-xl">
                                        <h3 className="text-lg font-bold mb-6 flex items-center gap-3">
                                            <Info className="w-5 h-5 text-blue-500" /> Objective
                                        </h3>
                                        <p className="text-xl text-gray-400 leading-relaxed font-medium">
                                            {activeLesson.assignment?.instructions || activeLesson.content}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="flex-1 flex flex-col items-center p-12 lg:p-24 overflow-y-auto">
                                <div className="max-w-3xl w-full space-y-12">
                                    <h1 className="text-5xl lg:text-6xl font-black tracking-tight leading-tight">{activeLesson.title}</h1>
                                    <article className="prose prose-invert prose-2xl max-w-none prose-headings:text-white prose-p:text-gray-400 prose-p:font-medium prose-p:leading-relaxed">
                                        {activeLesson.content}
                                    </article>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Bottom Cinema Controls */}
                <div className="h-24 bg-[#0B0F1A]/80 backdrop-blur-3xl border-t border-white/5 px-8 flex items-center justify-between">
                    <div className="flex items-center gap-6">
                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => setIsCinemaMode(!isCinemaMode)}
                                className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${isCinemaMode ? 'bg-blue-600 text-white' : 'bg-white/5 text-gray-400'}`}
                                title="Cinema Mode"
                            >
                                {isCinemaMode ? <Minimize2 className="w-5 h-5" /> : <Maximize2 className="w-5 h-5" />}
                            </button>
                        </div>
                        <div className="hidden sm:flex items-center gap-4">
                            <button
                                onClick={handleToggleCompletion}
                                className={`flex items-center gap-3 px-6 py-3 rounded-2xl font-black text-xs uppercase tracking-widest transition-all
                                ${activeLesson.is_completed ? 'bg-green-500 text-white' : 'bg-white/5 text-gray-400 hover:text-white'}`}
                            >
                                <CheckCircle className="w-4 h-4" />
                                {activeLesson.is_completed ? 'Finished' : 'Mark Lesson'}
                            </button>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        <button
                            disabled={lessonIndex === 0}
                            onClick={() => setActiveLessonId(allLessons[lessonIndex - 1].id)}
                            className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center hover:bg-white/10 disabled:opacity-20 transition-all"
                        >
                            <ChevronLeft className="w-6 h-6" />
                        </button>
                        <button
                            disabled={lessonIndex === allLessons.length - 1}
                            onClick={() => setActiveLessonId(allLessons[lessonIndex + 1].id)}
                            className="flex items-center gap-3 px-8 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white h-12 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all"
                        >
                            Next Module
                            <ChevronRight className="w-4 h-4" />
                        </button>
                    </div>
                </div>

                {/* Information Drawer (Optional/Contextual) - Only show in non-cinema mode */}
                {!isCinemaMode && (
                    <div className="max-w-6xl mx-auto w-full px-8 pb-32 animate-in fade-in slide-in-from-bottom-8 duration-700">
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 mt-12">
                            <div className="lg:col-span-2 space-y-12">
                                <div className="space-y-6">
                                    <div className="flex items-center gap-8 border-b border-white/5">
                                        {(['overview', 'resources', 'quiz', 'assignment'] as const).map((tab) => {
                                            if (tab === 'quiz' && !activeLesson.quiz) return null;
                                            if (tab === 'assignment' && activeLesson.lesson_type !== 'assignment') return null;
                                            return (
                                                <button
                                                    key={tab}
                                                    onClick={() => setActiveTab(tab)}
                                                    className={`pb-4 text-xs font-black uppercase tracking-[0.2em] transition-all relative
                                                    ${activeTab === tab ? 'text-blue-500' : 'text-gray-500 hover:text-white'}`}
                                                >
                                                    {tab}
                                                    {activeTab === tab && <div className="absolute bottom-0 inset-x-0 h-1 bg-blue-500 rounded-full shadow-[0_0_10px_rgba(59,130,246,0.5)]" />}
                                                </button>
                                            )
                                        })}
                                    </div>

                                    <div className="py-4">
                                        {activeTab === 'overview' && (
                                            <div className="space-y-6">
                                                <h3 className="text-xl font-bold">Module Overview</h3>
                                                <p className="text-gray-400 text-lg leading-relaxed font-medium">
                                                    {activeLesson.content}
                                                </p>
                                            </div>
                                        )}
                                        {activeTab === 'assignment' && activeLesson.lesson_type === 'assignment' && (
                                            <div className="space-y-8 animate-in fade-in duration-700">
                                                <div className="p-8 lg:p-12 rounded-[3.5rem] bg-white/[0.02] border border-white/5 backdrop-blur-3xl space-y-8">
                                                    <div className="space-y-4">
                                                        <h4 className="text-white font-bold flex items-center gap-3">
                                                            <MessageSquare className="w-5 h-5 text-blue-500" /> Elaborate your findings
                                                        </h4>
                                                        <textarea
                                                            value={submissionContent}
                                                            onChange={(e) => setSubmissionContent(e.target.value)}
                                                            placeholder="Describe your submission details here..."
                                                            className="w-full h-48 bg-black/40 border border-white/5 rounded-[2rem] p-8 text-gray-200 focus:outline-none focus:border-blue-500/30 transition-all resize-none font-medium"
                                                        />
                                                    </div>

                                                    <div className="space-y-4">
                                                        <h4 className="text-white font-bold flex items-center gap-3">
                                                            <Upload className="w-5 h-5 text-blue-500" /> Digital Assets
                                                        </h4>
                                                        <label className="flex flex-col items-center justify-center p-12 lg:p-20 border-2 border-dashed border-white/5 rounded-[3rem] hover:bg-white/[0.02] hover:border-blue-500/20 transition-all cursor-pointer group">
                                                            <input
                                                                type="file"
                                                                className="hidden"
                                                                onChange={(e) => setSubmissionFile(e.target.files?.[0] || null)}
                                                            />
                                                            <div className="w-20 h-20 rounded-[2rem] bg-blue-500/10 flex items-center justify-center text-blue-400 group-hover:scale-110 transition-transform mb-6">
                                                                <Upload className="w-8 h-8" />
                                                            </div>
                                                            <span className="text-sm font-bold text-gray-400 group-hover:text-white transition-colors">
                                                                {submissionFile ? submissionFile.name : 'Drop your project archive here'}
                                                            </span>
                                                            <span className="text-[10px] text-gray-600 mt-2 font-black uppercase tracking-widest">Maximum file size: 50MB</span>
                                                        </label>
                                                    </div>

                                                    <button
                                                        disabled={isSubmitting || (!submissionContent && !submissionFile)}
                                                        onClick={async () => {
                                                            if (!activeLesson?.assignment?.id) return;
                                                            setIsSubmitting(true);
                                                            try {
                                                                await submitAssignment(activeLesson.assignment.id, {
                                                                    content: submissionContent,
                                                                    file: submissionFile || undefined
                                                                });
                                                                handleToggleCompletion();
                                                                alert("Submission successful. Progress updated.");
                                                            } catch (err) {
                                                                console.error("Submission failed", err);
                                                                alert("An error occurred during submission.");
                                                            } finally {
                                                                setIsSubmitting(false);
                                                            }
                                                        }}
                                                        className="w-full h-16 rounded-[2rem] bg-blue-600 hover:bg-blue-700 text-white font-black uppercase tracking-widest shadow-2xl shadow-blue-600/20 transition-all disabled:opacity-30 disabled:grayscale"
                                                    >
                                                        {isSubmitting ? 'Transmitting...' : 'Upload Submission'}
                                                    </button>
                                                </div>
                                            </div>
                                        )}
                                        {activeTab === 'resources' && (
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                {activeLesson.resources?.map((res: any) => (
                                                    <a key={res.id} href={res.file} target="_blank" rel="noreferrer" className="p-6 bg-white/[0.02] border border-white/10 rounded-[2rem] flex items-center justify-between hover:bg-white/[0.05] transition-all group">
                                                        <div className="flex items-center gap-4">
                                                            <div className="w-12 h-12 rounded-2xl bg-blue-500/10 flex items-center justify-center text-blue-400 group-hover:scale-110 transition-transform">
                                                                <Download className="w-5 h-5" />
                                                            </div>
                                                            <div>
                                                                <p className="text-sm font-bold">{res.title}</p>
                                                                <p className="text-[10px] text-gray-500 uppercase font-black">{res.file_type} • {res.file_size}</p>
                                                            </div>
                                                        </div>
                                                    </a>
                                                ))}
                                                {!activeLesson.resources?.length && <p className="text-gray-500 font-bold uppercase text-xs">No assets linked to this module.</p>}
                                            </div>
                                        )}
                                        {activeTab === 'quiz' && activeLesson.quiz && <QuizComponent quiz={activeLesson.quiz} />}
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-8">
                                <div className="p-8 rounded-[2.5rem] bg-gradient-to-br from-blue-600/10 to-indigo-600/10 border border-white/5 backdrop-blur-xl">
                                    <h4 className="text-xs font-black uppercase tracking-widest text-blue-400 mb-6">Instructor Space</h4>
                                    <div className="flex items-center gap-4 mb-6">
                                        <div className="w-14 h-14 rounded-2xl bg-white/5 border border-white/10" />
                                        <div>
                                            <p className="font-bold text-white">{course.instructor_name || 'Instructor'}</p>
                                            <p className="text-[10px] text-gray-500 font-black uppercase">Professional Mentor</p>
                                        </div>
                                    </div>
                                    <button className="w-full py-4 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center gap-3 text-[10px] font-black uppercase tracking-widest hover:bg-white/10 transition-all">
                                        <MessageSquare className="w-4 h-4" /> Message Studio
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
};
