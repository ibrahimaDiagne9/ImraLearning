import { useState, useEffect } from 'react';
import { Video, Users, Globe, Lock, Loader2 } from 'lucide-react';
import { Modal } from '../ui/Modal';
import { getCourses, createLiveSession, startLiveSession } from '../../services/api';
import { useAuth } from '../../context/AuthContext';

interface GoLiveModalProps {
    isOpen: boolean;
    onClose: () => void;
}

interface Course {
    id: number;
    title: string;
    enrollment_count: number;
}

export const GoLiveModal = ({ isOpen, onClose }: GoLiveModalProps) => {
    const { user } = useAuth();
    const [courses, setCourses] = useState<Course[]>([]);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const [formData, setFormData] = useState({
        title: '',
        description: '',
        courseId: '',
        isPublic: true,
        meetingLink: ''
    });

    useEffect(() => {
        if (isOpen) {
            fetchCourses();
        }
    }, [isOpen]);

    const fetchCourses = async () => {
        try {
            const data = await getCourses({ instructor: user?.id });
            setCourses(data);
        } catch (error) {
            console.error('Failed to fetch courses:', error);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.title) return;

        setIsSubmitting(true);
        try {
            const session = await createLiveSession({
                title: formData.title,
                description: formData.description,
                course: formData.courseId || undefined,
                is_public: formData.isPublic,
                meeting_link: formData.meetingLink
            });

            // Automatically start the session
            await startLiveSession(session.id);

            onClose();
            // In a real app, we might redirect to the live session page or show a success toast
            window.location.reload();
        } catch (error) {
            console.error('Failed to start live session:', error);
        } finally {
            setIsSubmitting(false);
        }
    };

    const selectedCourse = courses.find(c => c.id.toString() === formData.courseId);

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title="Go Live"
            icon={<Video className="w-5 h-5" />}
        >
            <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                        Session Title *
                    </label>
                    <input
                        type="text"
                        required
                        value={formData.title}
                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                        placeholder="e.g., Introduction to React Hooks"
                        className="w-full bg-[#1F2937] border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-blue-500 transition-colors"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                        Description
                    </label>
                    <textarea
                        rows={3}
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        placeholder="What will you cover in this session?"
                        className="w-full bg-[#1F2937] border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-blue-500 transition-colors resize-none"
                    />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                            Select Course
                        </label>
                        <select
                            value={formData.courseId}
                            onChange={(e) => setFormData({ ...formData, courseId: e.target.value })}
                            className="w-full bg-[#1F2937] border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-blue-500 transition-colors appearance-none"
                        >
                            <option value="">Choose a course...</option>
                            {courses.map(course => (
                                <option key={course.id} value={course.id}>{course.title}</option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                            Meeting Link (Optional)
                        </label>
                        <input
                            type="url"
                            value={formData.meetingLink}
                            onChange={(e) => setFormData({ ...formData, meetingLink: e.target.value })}
                            placeholder="Zoom/Google Meet link"
                            className="w-full bg-[#1F2937] border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-blue-500 transition-colors"
                        />
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                        Privacy Settings
                    </label>
                    <div className="grid grid-cols-2 gap-4">
                        <button
                            type="button"
                            onClick={() => setFormData({ ...formData, isPublic: true })}
                            className={`p-4 rounded-xl flex flex-col items-center gap-2 border transition-all ${formData.isPublic
                                ? 'border-blue-500 bg-blue-500/10 text-blue-400'
                                : 'border-gray-700 bg-[#1F2937] text-gray-400 hover:border-gray-600'
                                }`}
                        >
                            <Globe className="w-6 h-6" />
                            <span className="font-bold">Public</span>
                            <span className="text-xs opacity-60">Anyone can join</span>
                        </button>
                        <button
                            type="button"
                            onClick={() => setFormData({ ...formData, isPublic: false })}
                            className={`p-4 rounded-xl flex flex-col items-center gap-2 border transition-all ${!formData.isPublic
                                ? 'border-blue-500 bg-blue-500/10 text-blue-400'
                                : 'border-gray-700 bg-[#1F2937] text-gray-400 hover:border-gray-600'
                                }`}
                        >
                            <Lock className="w-6 h-6" />
                            <span className="font-bold">Private</span>
                            <span className="text-xs opacity-60">Enrolled only</span>
                        </button>
                    </div>
                </div>

                <div className="bg-[#1F2937] border border-gray-800 rounded-xl p-4">
                    <div className="flex items-center gap-3 text-blue-400 mb-1">
                        <Users className="w-5 h-5" />
                        <span className="font-bold">Expected Attendees</span>
                    </div>
                    <p className="text-gray-500 text-sm pl-8">
                        {selectedCourse
                            ? `${selectedCourse.enrollment_count} students enrolled in this course`
                            : 'Select a course to see attendee count'}
                    </p>
                </div>

                <div className="flex justify-end gap-3 pt-2">
                    <button
                        type="button"
                        onClick={onClose}
                        className="px-6 py-2.5 rounded-lg text-gray-300 font-medium hover:text-white hover:bg-gray-800 transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        disabled={isSubmitting || !formData.title}
                        className="px-6 py-2.5 rounded-lg bg-blue-600 text-white font-bold hover:bg-blue-700 transition-colors shadow-lg shadow-blue-900/20 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                    >
                        {isSubmitting ? (
                            <>
                                <Loader2 className="w-4 h-4 animate-spin" />
                                Starting...
                            </>
                        ) : 'Start Live Session'}
                    </button>
                </div>
            </form>
        </Modal>
    );
};
