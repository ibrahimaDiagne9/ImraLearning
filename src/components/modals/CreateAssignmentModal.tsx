import { useState, useEffect } from 'react';
import { FileText, Calendar, WalletCards, Loader2 } from 'lucide-react';
import { Modal } from '../ui/Modal';
import { getInstructorCourses, createLesson, createAssignment } from '../../services/api';

interface CreateAssignmentModalProps {
    isOpen: boolean;
    onClose: () => void;
}

interface Course {
    id: number;
    title: string;
    sections: { id: number; title: string }[];
}

export const CreateAssignmentModal = ({ isOpen, onClose }: CreateAssignmentModalProps) => {
    const [courses, setCourses] = useState<Course[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const [form, setForm] = useState({
        title: '',
        instructions: '',
        course_id: '',
        due_date: '',
        total_points: 100
    });

    useEffect(() => {
        if (isOpen) {
            fetchCourses();
        }
    }, [isOpen]);

    const fetchCourses = async () => {
        setIsLoading(true);
        try {
            const data = await getInstructorCourses();
            setCourses(data);
        } catch (error) {
            console.error("Failed to fetch courses", error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSubmit = async () => {
        if (!form.title || !form.course_id || !form.instructions) return;

        setIsSubmitting(true);
        try {
            const course = courses.find(c => c.id === parseInt(form.course_id));
            if (!course || course.sections.length === 0) {
                // Should probably show alert here
                return;
            }

            // 1. Create Lesson
            const lesson = await createLesson({
                title: form.title,
                lesson_type: 'assignment',
                section: course.sections[0].id, // Default to first section
                order: 99 // Default to end
            });

            // 2. Create Assignment Details
            await createAssignment(lesson.id, {
                title: form.title,
                instructions: form.instructions,
                total_points: form.total_points,
                due_date: form.due_date || null
            });

            onClose();
        } catch (error) {
            console.error("Failed to create assignment", error);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title="Create Assignment"
            icon={<FileText className="w-5 h-5" />}
        >
            <div className="space-y-6">
                <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                        Assignment Title *
                    </label>
                    <input
                        type="text"
                        value={form.title}
                        onChange={(e) => setForm({ ...form, title: e.target.value })}
                        placeholder="e.g., Build a Todo App with React"
                        className="w-full bg-[#1F2937] border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-blue-500 transition-colors"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                        Instructions *
                    </label>
                    <textarea
                        rows={4}
                        value={form.instructions}
                        onChange={(e) => setForm({ ...form, instructions: e.target.value })}
                        placeholder="Provide detailed instructions for the assignment..."
                        className="w-full bg-[#1F2937] border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-blue-500 transition-colors resize-none"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                        Assign to Course *
                    </label>
                    <select
                        value={form.course_id}
                        onChange={(e) => setForm({ ...form, course_id: e.target.value })}
                        className="w-full bg-[#1F2937] border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-blue-500 transition-colors appearance-none"
                        disabled={isLoading}
                    >
                        <option value="">{isLoading ? 'Loading courses...' : 'Select a course...'}</option>
                        {courses.map(course => (
                            <option key={course.id} value={course.id}>{course.title}</option>
                        ))}
                    </select>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                            <Calendar className="w-4 h-4 inline mr-1" /> Due Date *
                        </label>
                        <input
                            type="datetime-local"
                            value={form.due_date}
                            onChange={(e) => setForm({ ...form, due_date: e.target.value })}
                            className="w-full bg-[#1F2937] border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-blue-500 transition-colors scheme-dark"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                            <WalletCards className="w-4 h-4 inline mr-1" /> Points
                        </label>
                        <input
                            type="number"
                            value={form.total_points}
                            onChange={(e) => setForm({ ...form, total_points: parseInt(e.target.value) })}
                            placeholder="100"
                            className="w-full bg-[#1F2937] border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-blue-500 transition-colors"
                        />
                    </div>
                </div>

                <div className="flex justify-end gap-3 pt-2">
                    <button
                        onClick={onClose}
                        className="px-6 py-2.5 rounded-lg text-gray-300 font-medium hover:text-white hover:bg-gray-800 transition-colors"
                        disabled={isSubmitting}
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSubmit}
                        disabled={isSubmitting || !form.title || !form.course_id}
                        className="px-6 py-2.5 rounded-lg bg-blue-600 text-white font-bold hover:bg-blue-700 transition-colors shadow-lg shadow-blue-900/20 disabled:opacity-50 flex items-center gap-2"
                    >
                        {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
                        {isSubmitting ? 'Creating...' : 'Create Assignment'}
                    </button>
                </div>
            </div>
        </Modal>
    );
};
