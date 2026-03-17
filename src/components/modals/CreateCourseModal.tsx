import { BookOpen, Upload, DollarSign, Clock, Loader2 } from 'lucide-react';
import { Modal } from '../ui/Modal';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import api from '../../services/api';
import { useNotifications } from '../../context/NotificationContext';
import { isAxiosError } from 'axios';

interface CreateCourseModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export const CreateCourseModal = ({ isOpen, onClose }: CreateCourseModalProps) => {
    const navigate = useNavigate();
    const { addNotification } = useNotifications();
    const [isLoading, setIsLoading] = useState(false);

    const [formData, setFormData] = useState({
        title: '',
        description: '',
        category: 'development',
        level: 'beginner',
        price: '0.00',
        duration_hours: '0'
    });
    const [thumbnail, setThumbnail] = useState<File | null>(null);
    const [thumbnailPreview, setThumbnailPreview] = useState<string | null>(null);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setThumbnail(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setThumbnailPreview(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleCreate = async () => {
        if (!formData.title || !formData.description) {
            addNotification({ type: 'system', title: 'Error', description: 'Please fill in all required fields.' });
            return;
        }

        const priceNum = parseFloat(formData.price);
        const durationNum = parseFloat(formData.duration_hours);

        if (isNaN(priceNum) || priceNum < 0) {
            addNotification({ type: 'system', title: 'Error', description: 'Price must be zero or a positive number.' });
            return;
        }

        if (isNaN(durationNum) || durationNum < 0) {
            addNotification({ type: 'system', title: 'Error', description: 'Duration must be zero or a positive number.' });
            return;
        }

        setIsLoading(true);
        try {
            const data = new FormData();
            data.append('title', formData.title);
            data.append('description', formData.description);
            data.append('category', formData.category);
            data.append('level', formData.level);
            data.append('price', formData.price);
            data.append('duration_hours', formData.duration_hours);
            if (thumbnail) {
                data.append('thumbnail', thumbnail);
            }

            const response = await api.post('/courses/', data, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });
            onClose();
            addNotification({ type: 'system', title: 'Success', description: 'Course created successfully!' });
            navigate(`/studio/${response.data.id}`);
        } catch (error) {
            console.error('Failed to create course', error);
            
            let errorMsg = 'Failed to create course. Please try again.';
            if (isAxiosError(error) && error.response?.data) {
                // Assuming Django REST Framework error structure
                const data = error.response.data;
                const messages = Object.values(data).flat();
                if (messages.length > 0) {
                    errorMsg = messages.join(' ');
                }
            }
            
            addNotification({ type: 'system', title: 'Error', description: errorMsg });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title="Create New Course"
            icon={<BookOpen className="w-5 h-5" />}
        >
            <div className="space-y-6">
                <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                        Course Name *
                    </label>
                    <input
                        type="text"
                        name="title"
                        value={formData.title}
                        onChange={handleChange}
                        placeholder="e.g., Complete Web Development Bootcamp"
                        className="w-full bg-[#1F2937] border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-blue-500 transition-colors"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                        Course Description *
                    </label>
                    <textarea
                        name="description"
                        value={formData.description}
                        onChange={handleChange}
                        rows={4}
                        placeholder="Describe what students will learn in this course..."
                        className="w-full bg-[#1F2937] border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-blue-500 transition-colors resize-none"
                    />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                            Category *
                        </label>
                        <select
                            name="category"
                            value={formData.category}
                            onChange={handleChange}
                            className="w-full bg-[#1F2937] border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-blue-500 transition-colors appearance-none"
                        >
                            <option value="development">Development</option>
                            <option value="business">Business</option>
                            <option value="design">Design</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                            Difficulty Level *
                        </label>
                        <select
                            name="level"
                            value={formData.level}
                            onChange={handleChange}
                            className="w-full bg-[#1F2937] border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-blue-500 transition-colors appearance-none"
                        >
                            <option value="beginner">Beginner</option>
                            <option value="intermediate">Intermediate</option>
                            <option value="advanced">Advanced</option>
                        </select>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                            <DollarSign className="w-4 h-4 inline mr-1" /> Price (USD)
                        </label>
                        <input
                            type="number"
                            name="price"
                            value={formData.price}
                            onChange={handleChange}
                            placeholder="49.99"
                            step="0.01"
                            className="w-full bg-[#1F2937] border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-blue-500 transition-colors"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                            <Clock className="w-4 h-4 inline mr-1" /> Duration (hours)
                        </label>
                        <input
                            type="number"
                            name="duration_hours"
                            value={formData.duration_hours}
                            onChange={handleChange}
                            placeholder="20"
                            className="w-full bg-[#1F2937] border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-blue-500 transition-colors"
                        />
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                        Course Thumbnail
                    </label>
                    <input
                        type="file"
                        id="course-thumbnail"
                        accept="image/*"
                        onChange={handleFileChange}
                        className="hidden"
                    />
                    <div
                        onClick={() => document.getElementById('course-thumbnail')?.click()}
                        className={`border-2 border-dashed rounded-xl p-8 flex flex-col items-center justify-center text-center transition-colors cursor-pointer bg-[#1F2937]/50 overflow-hidden relative min-h-[160px] ${thumbnailPreview ? 'border-blue-500' : 'border-gray-700 hover:border-blue-500'}`}
                    >
                        {thumbnailPreview ? (
                            <div className="absolute inset-0">
                                <img src={thumbnailPreview} alt="Preview" className="w-full h-full object-cover opacity-50" />
                                <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/40">
                                    <Upload className="w-8 h-8 text-white mb-2" />
                                    <p className="text-white font-bold text-sm">Change Thumbnail</p>
                                    <p className="text-gray-200 text-xs mt-1">{thumbnail?.name}</p>
                                </div>
                            </div>
                        ) : (
                            <>
                                <Upload className="w-10 h-10 text-gray-500 mb-3" />
                                <p className="text-gray-300 font-medium">Click to upload or drag and drop</p>
                                <p className="text-gray-500 text-sm mt-1">PNG, JPG up to 5MB</p>
                            </>
                        )}
                    </div>
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
                        onClick={handleCreate}
                        disabled={isLoading}
                        className="px-6 py-2.5 rounded-lg bg-blue-600 text-white font-bold hover:bg-blue-700 transition-colors shadow-lg shadow-blue-900/20 disabled:opacity-50 flex items-center gap-2"
                    >
                        {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
                        {isLoading ? 'Creating...' : 'Create Course'}
                    </button>
                </div>
            </div>
        </Modal>
    );
};
