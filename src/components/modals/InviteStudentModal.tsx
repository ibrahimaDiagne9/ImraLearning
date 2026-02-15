import { UserPlus, Mail, User, Loader2 } from 'lucide-react';
import { Modal } from '../ui/Modal';
import { useState, useEffect } from 'react';
import { inviteStudent, getCourses } from '../../services/api';
import { useNotifications } from '../../context/NotificationContext';

interface InviteStudentModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export const InviteStudentModal = ({ isOpen, onClose }: InviteStudentModalProps) => {
    const { addNotification } = useNotifications();
    const [isLoading, setIsLoading] = useState(false);
    const [courses, setCourses] = useState<any[]>([]);

    const [formData, setFormData] = useState({
        name: '',
        email: '',
        courseId: ''
    });

    useEffect(() => {
        if (isOpen) {
            fetchCourses();
        }
    }, [isOpen]);

    const fetchCourses = async () => {
        try {
            const data = await getCourses();
            setCourses(data);
        } catch (error) {
            console.error('Failed to fetch courses', error);
        }
    };

    const handleInvite = async () => {
        if (!formData.email || !formData.courseId) {
            addNotification({ type: 'system', title: 'Error', description: 'Please provide email and select a course.' });
            return;
        }

        setIsLoading(true);
        try {
            await inviteStudent(formData.email, formData.name, parseInt(formData.courseId));
            addNotification({ type: 'system', title: 'Success', description: `Invitation sent to ${formData.email}` });
            setFormData({ name: '', email: '', courseId: '' });
            onClose();
        } catch (error) {
            console.error('Failed to invite student', error);
            addNotification({ type: 'system', title: 'Error', description: 'Failed to send invitation.' });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title="Invite Student"
            icon={<UserPlus className="w-5 h-5" />}
        >
            <div className="space-y-6">
                <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                        Student Name (Optional)
                    </label>
                    <div className="relative">
                        <User className="absolute left-3 top-3.5 w-5 h-5 text-gray-500" />
                        <input
                            type="text"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            placeholder="John Doe"
                            className="w-full bg-[#1F2937] border border-gray-700 rounded-lg pl-10 pr-4 py-3 text-white focus:outline-none focus:border-blue-500 transition-colors"
                        />
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                        Email Address *
                    </label>
                    <div className="relative">
                        <Mail className="absolute left-3 top-3.5 w-5 h-5 text-gray-500" />
                        <input
                            type="email"
                            value={formData.email}
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            placeholder="john@example.com"
                            className="w-full bg-[#1F2937] border border-gray-700 rounded-lg pl-10 pr-4 py-3 text-white focus:outline-none focus:border-blue-500 transition-colors"
                        />
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                        Assign to Course *
                    </label>
                    <select
                        value={formData.courseId}
                        onChange={(e) => setFormData({ ...formData, courseId: e.target.value })}
                        className="w-full bg-[#1F2937] border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-blue-500 transition-colors appearance-none"
                    >
                        <option value="">Select a course...</option>
                        {courses.map(course => (
                            <option key={course.id} value={course.id}>{course.title}</option>
                        ))}
                    </select>
                </div>

                <div className="bg-blue-900/10 border border-blue-900/30 rounded-xl p-4">
                    <h4 className="font-bold text-blue-400 text-sm mb-2">Bulk Upload</h4>
                    <p className="text-gray-400 text-sm mb-3">Upload a CSV file to invite multiple students at once.</p>
                    <button className="text-sm border border-gray-600 hover:border-blue-500 text-gray-300 hover:text-white px-3 py-1.5 rounded transition-colors w-full">
                        Upload CSV
                    </button>
                </div>

                <div className="flex justify-end gap-3 pt-2">
                    <button
                        onClick={onClose}
                        disabled={isLoading}
                        className="px-6 py-2.5 rounded-lg text-gray-300 font-medium hover:text-white hover:bg-gray-800 transition-colors disabled:opacity-50"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleInvite}
                        disabled={isLoading}
                        className="px-6 py-2.5 rounded-lg bg-blue-600 text-white font-bold hover:bg-blue-700 transition-colors shadow-lg shadow-blue-900/20 disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                        {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
                        {isLoading ? 'Sending...' : 'Send Invitation'}
                    </button>
                </div>
            </div>
        </Modal>
    );
};
