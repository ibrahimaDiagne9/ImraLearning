import { MessageSquare, Send } from 'lucide-react';
import { Modal } from '../ui/Modal';
import { useState, useEffect } from 'react';
import api from '../../services/api';

interface Course {
    id: number;
    title: string;
}

interface CreateDiscussionModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (title: string, content: string, course: string | null) => void;
}

export const CreateDiscussionModal = ({ isOpen, onClose, onSubmit }: CreateDiscussionModalProps) => {
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [courseId, setCourseId] = useState<string>('general');
    const [courses, setCourses] = useState<Course[]>([]);

    useEffect(() => {
        if (isOpen) {
            fetchCourses();
        }
    }, [isOpen]);

    const fetchCourses = async () => {
        try {
            const response = await api.get('/courses/');
            setCourses(response.data);
        } catch (error) {
            console.error('Failed to fetch courses', error);
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (title && content) {
            // Send null if 'general' is selected, otherwise send the course ID
            const courseValue = courseId === 'general' ? null : courseId;
            onSubmit(title, content, courseValue);
            setTitle('');
            setContent('');
            setCourseId('general');
            onClose();
        }
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title="Start New Discussion"
            icon={<MessageSquare className="w-5 h-5" />}
        >
            <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                        Title
                    </label>
                    <input
                        type="text"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder="What's on your mind?"
                        className="w-full bg-[#1F2937] border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-blue-500 transition-colors"
                        required
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                        Topic / Course
                    </label>
                    <select
                        value={courseId}
                        onChange={(e) => setCourseId(e.target.value)}
                        className="w-full bg-[#1F2937] border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-blue-500 transition-colors"
                    >
                        <option value="general">General</option>
                        {courses.map(course => (
                            <option key={course.id} value={course.id.toString()}>
                                {course.title}
                            </option>
                        ))}
                    </select>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                        Content
                    </label>
                    <textarea
                        rows={5}
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        placeholder="Describe your question or share your thoughts..."
                        className="w-full bg-[#1F2937] border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-blue-500 transition-colors resize-none"
                        required
                    />
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
                        className="px-6 py-2.5 rounded-lg bg-blue-600 text-white font-bold hover:bg-blue-700 transition-colors shadow-lg shadow-blue-900/20 flex items-center gap-2"
                    >
                        <Send className="w-4 h-4" />
                        Post Discussion
                    </button>
                </div>
            </form>
        </Modal>
    );
};
