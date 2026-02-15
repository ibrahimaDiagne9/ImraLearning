import { useState } from 'react';
import { CourseCard } from './CourseCard';
import { BookOpen, Loader2, Plus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useInstructorCourses } from '../../hooks/useCourseQueries';
import { useAuth } from '../../context/AuthContext';

export const TeacherCoursesPage = () => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const [filter, setFilter] = useState<'all' | 'active' | 'draft'>('all');

    const { data: courses = [], isLoading } = useInstructorCourses(user?.id);

    const filteredCourses = (courses || []).filter((course: any) => {
        if (filter === 'all') return true;
        const status = course.is_published ? 'active' : 'draft';
        return status === filter;
    });

    if (isLoading) {
        return (
            <div className="h-full flex items-center justify-center py-20">
                <Loader2 className="w-12 h-12 text-blue-500 animate-spin" />
            </div>
        );
    }

    return (
        <div className="p-6 max-w-7xl mx-auto">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-white mb-2">My Courses (Instructor)</h1>
                    <p className="text-gray-400">Manage and track all your courses</p>
                </div>

                <div className="flex items-center gap-3">
                    <div className="flex items-center bg-gray-800 p-1 rounded-lg">
                        {(['all', 'active', 'draft'] as const).map((f) => (
                            <button
                                key={f}
                                onClick={() => setFilter(f)}
                                className={`px-4 py-1.5 rounded-md text-sm font-medium capitalize transition-colors ${filter === f
                                    ? 'bg-blue-600 text-white'
                                    : 'text-gray-400 hover:text-white'
                                    }`}
                            >
                                {f === 'all' ? 'All Courses' : f}
                            </button>
                        ))}
                    </div>
                    <button
                        onClick={() => navigate('/studio/new')}
                        className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg text-sm font-bold shadow-lg shadow-blue-500/20 transition-all"
                    >
                        <Plus className="w-4 h-4" />
                        New Course
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredCourses.map((course: any) => (
                    <CourseCard
                        key={course.id}
                        id={course.id}
                        title={course.title}
                        description={course.description}
                        icon={BookOpen} // Default icon for now
                        stats={{
                            students: course.enrollment_count || 0,
                            modules: course.sections?.length || 0,
                            hours: course.duration_hours || 0
                        }}
                        status={course.is_published ? 'active' : 'draft'}
                    />
                ))}
            </div>

            {filteredCourses.length === 0 && (
                <div className="text-center py-20 bg-gray-900/50 rounded-3xl border border-gray-800 border-dashed">
                    <div className="w-16 h-16 bg-gray-800 rounded-2xl flex items-center justify-center mx-auto mb-4">
                        <BookOpen className="w-8 h-8 text-gray-500" />
                    </div>
                    <h3 className="text-xl font-bold text-white mb-2">No courses found</h3>
                    <p className="text-gray-400 max-w-xs mx-auto">You haven't created any courses yet. Start by creating your first course curriculum!</p>
                </div>
            )}
        </div>
    );
};
