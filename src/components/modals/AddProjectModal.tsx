import { Briefcase, Globe, Github, Link } from 'lucide-react';
import { Modal } from '../ui/Modal';

interface AddProjectModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export const AddProjectModal = ({ isOpen, onClose }: AddProjectModalProps) => {
    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title="Add New Project"
            icon={<Briefcase className="w-5 h-5" />}
        >
            <div className="space-y-6">
                <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                        Project Title *
                    </label>
                    <input
                        type="text"
                        placeholder="e.g., E-Commerce Dashboard"
                        className="w-full bg-[#1F2937] border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-blue-500 transition-colors"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                        Description *
                    </label>
                    <textarea
                        rows={3}
                        placeholder="Short summary of your project..."
                        className="w-full bg-[#1F2937] border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-blue-500 transition-colors resize-none"
                    />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                            <Github className="w-4 h-4 inline mr-1" /> Repo Link
                        </label>
                        <input
                            type="url"
                            placeholder="github.com/..."
                            className="w-full bg-[#1F2937] border border-gray-700 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-blue-500 transition-colors text-sm"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                            <Globe className="w-4 h-4 inline mr-1" /> Live Demo
                        </label>
                        <input
                            type="url"
                            placeholder="https://..."
                            className="w-full bg-[#1F2937] border border-gray-700 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-blue-500 transition-colors text-sm"
                        />
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                        Technologies Used
                    </label>
                    <div className="flex flex-wrap gap-2 mb-3">
                        {['React', 'Tailwind', 'Node.js', 'PostgreSQL'].map(tech => (
                            <span key={tech} className="bg-blue-600/20 text-blue-400 px-2 py-1 rounded text-xs font-medium border border-blue-500/20">
                                {tech}
                            </span>
                        ))}
                    </div>
                    <div className="relative">
                        <Link className="absolute left-3 top-3 w-4 h-4 text-gray-500" />
                        <input
                            type="text"
                            placeholder="Add tags..."
                            className="w-full bg-[#1F2937] border border-gray-700 rounded-lg pl-9 pr-4 py-2.5 text-white focus:outline-none focus:border-blue-500 transition-colors text-sm"
                        />
                    </div>
                </div>

                <div className="flex justify-end gap-3 pt-2">
                    <button
                        onClick={onClose}
                        className="px-6 py-2.5 rounded-lg text-gray-300 font-medium hover:text-white hover:bg-gray-800 transition-colors"
                    >
                        Cancel
                    </button>
                    <button className="px-6 py-2.5 rounded-lg bg-blue-600 text-white font-bold hover:bg-blue-700 transition-colors shadow-lg shadow-blue-900/20">
                        Add to Portfolio
                    </button>
                </div>
            </div>
        </Modal>
    );
};
