import { useState, useEffect } from 'react';
import { ChevronLeft, X, MessageSquare } from 'lucide-react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { CourseHeader } from './CourseHeader';
import { CourseTabs } from './CourseTabs';
import { OverviewTab } from './OverviewTab';
import { CurriculumTab } from './CurriculumTab';
import { ResourcesTab } from './ResourcesTab';
import { PlayerView } from './player/PlayerView';
import type { Course } from '../../hooks/useLessonPlayer';

export const LessonPlayer = ({ onBack }: { onBack: () => void }) => {
    const { courseId } = useParams();
    const navigate = useNavigate();

    const [course, setCourse] = useState<Course | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [viewMode, setViewMode] = useState<'dashboard' | 'learning'>('dashboard');
    const [dashboardTab, setDashboardTab] = useState('overview');

    useEffect(() => {
        if (courseId) fetchCourse();
    }, [courseId]);

    const fetchCourse = async () => {
        setIsLoading(true);
        setError(null);
        try {
            const response = await api.get(`/courses/${courseId}/`);
            setCourse(response.data);
        } catch (err: any) {
            console.error('Failed to fetch course detail', err);
            setError(err.response?.data?.error || 'Failed to load course');
        } finally {
            setIsLoading(false);
        }
    };

    if (isLoading) {
        return (
            <div className="h-screen bg-[#0A0D14] flex flex-col items-center justify-center space-y-4">
                <div className="w-12 h-12 border-2 border-blue-500/20 border-t-blue-500 rounded-full animate-spin" />
                <p className="text-gray-400 text-sm">Synchronizing masterclass...</p>
            </div>
        );
    }

    if (error || !course) {
        return (
            <div className="h-screen bg-[#0A0D14] flex flex-col items-center justify-center p-6 text-center">
                <X className="w-12 h-12 text-red-500 mb-4" />
                <h2 className="text-2xl font-bold text-white mb-2">Access Error</h2>
                <p className="text-gray-400 mb-8">{error || "Course not found"}</p>
                <div className="flex gap-4">
                    <button onClick={() => navigate(-1)} className="px-6 py-2 bg-white/5 text-white rounded-lg hover:bg-white/10 transition-all">Go Back</button>
                    <button onClick={fetchCourse} className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all">Retry</button>
                </div>
            </div>
        );
    }

    if (viewMode === 'learning') {
        return <PlayerView course={course} onBack={() => setViewMode('dashboard')} setCourse={setCourse} />;
    }

    return (
        <div className="min-h-screen bg-[#07090F] text-white font-sans">
            <div className="max-w-7xl mx-auto px-6 py-12">
                <button
                    onClick={() => onBack()}
                    className="flex items-center gap-2 text-xs font-bold text-gray-400 hover:text-white transition-all mb-8 group"
                >
                    <ChevronLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                    Back to Courses
                </button>

                <div className="space-y-12">
                    <CourseHeader
                        course={course}
                        onContinue={() => setViewMode('learning')}
                        progress={course.progress_percentage || 0}
                    />

                    <div className="space-y-6">
                        <CourseTabs activeTab={dashboardTab} setActiveTab={setDashboardTab} />

                        <div className="min-h-[400px]">
                            {dashboardTab === 'overview' && <OverviewTab course={course} />}
                            {dashboardTab === 'curriculum' && (
                                <CurriculumTab
                                    course={course}
                                    onPlayLesson={() => {
                                        setViewMode('learning');
                                    }}
                                />
                            )}
                            {dashboardTab === 'discussions' && (
                                <div className="bg-[#0B0F1A] border border-white/5 rounded-3xl p-12 text-center">
                                    <MessageSquare className="w-12 h-12 text-blue-500 mx-auto mb-4" />
                                    <h3 className="text-xl font-bold mb-2">Discussions Board</h3>
                                    <p className="text-gray-400 mb-8">Join the conversation with other students.</p>
                                    <button className="px-8 py-3 bg-blue-600 text-white rounded-xl font-bold transition-all shadow-lg shadow-blue-600/20">Open Discussions</button>
                                </div>
                            )}
                            {dashboardTab === 'resources' && <ResourcesTab course={course} />}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
