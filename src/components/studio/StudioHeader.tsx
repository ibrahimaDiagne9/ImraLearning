import React from 'react';
import { ArrowLeft, Eye, Save, Globe, Loader2, Layout } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface StudioHeaderProps {
    courseId?: string;
    courseTitle: string;
    setCourseTitle: (title: string) => void;
    isSaving: boolean;
    onPreview: () => void;
    onSave: (publish?: boolean) => void;
    onToggleSidebar: () => void;
}

export const StudioHeader: React.FC<StudioHeaderProps> = ({
    courseId,
    courseTitle,
    setCourseTitle,
    isSaving,
    onPreview,
    onSave,
    onToggleSidebar
}) => {
    const navigate = useNavigate();

    return (
        <header className="h-16 flex items-center justify-between px-4 md:px-6 bg-[#0B0F1A] border-b border-gray-800 z-20">
            <div className="flex items-center gap-2 md:gap-4">
                <button
                    onClick={() => navigate('/dashboard')}
                    className="p-2 text-gray-400 hover:text-white transition-colors"
                >
                    <ArrowLeft className="w-5 h-5" />
                </button>
                <div className="h-6 w-px bg-gray-800"></div>
                <button
                    onClick={onToggleSidebar}
                    className="lg:hidden p-2 text-blue-400 hover:bg-blue-500/10 rounded-lg transition-colors"
                    title="Toggle Curriculum"
                >
                    <Layout className="w-5 h-5" />
                </button>
                <div className="hidden sm:block h-6 w-px bg-gray-800 lg:hidden"></div>
                <div className="hidden md:block">
                    <input
                        value={courseTitle}
                        onChange={(e) => setCourseTitle(e.target.value)}
                        className="bg-transparent text-sm font-bold text-white uppercase tracking-tight focus:outline-none focus:ring-1 focus:ring-blue-500/50 rounded px-1 -mx-1"
                    />
                    <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">Course Draft • ID: {courseId || 'New'}</p>
                </div>
            </div>

            <div className="flex items-center gap-2 md:gap-3">
                <button
                    onClick={onPreview}
                    className="flex items-center gap-2 px-3 md:px-4 py-2 text-xs font-bold text-gray-400 hover:text-white transition-colors"
                >
                    <Eye className="w-4 h-4" />
                    <span className="hidden sm:inline">Preview</span>
                </button>
                <button
                    onClick={() => onSave(false)}
                    disabled={isSaving}
                    className="flex items-center gap-2 px-3 md:px-4 py-2 text-xs font-bold text-blue-400 bg-blue-500/10 border border-blue-500/20 rounded-lg hover:bg-blue-500/20 transition-colors disabled:opacity-50"
                >
                    {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                    <span className="hidden sm:inline">Save</span>
                </button>
                <button
                    onClick={() => onSave(true)}
                    disabled={isSaving}
                    className="flex items-center gap-2 px-4 md:px-6 py-2 text-xs font-black text-white bg-blue-600 rounded-lg hover:bg-blue-700 shadow-lg shadow-blue-900/20 transition-all uppercase tracking-widest disabled:opacity-50"
                >
                    <Globe className="w-4 h-4" />
                    <span className="hidden sm:inline">Publish</span>
                </button>
            </div>
        </header>
    );
};
