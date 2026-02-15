import React from 'react';
import { ArrowLeft, Eye, Save, Globe, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface StudioHeaderProps {
    courseId?: string;
    courseTitle: string;
    setCourseTitle: (title: string) => void;
    isSaving: boolean;
    onPreview: () => void;
    onSave: (publish?: boolean) => void;
}

export const StudioHeader: React.FC<StudioHeaderProps> = ({
    courseId,
    courseTitle,
    setCourseTitle,
    isSaving,
    onPreview,
    onSave
}) => {
    const navigate = useNavigate();

    return (
        <header className="h-16 flex items-center justify-between px-6 bg-[#0B0F1A] border-b border-gray-800 z-20">
            <div className="flex items-center gap-4">
                <button
                    onClick={() => navigate('/dashboard')}
                    className="p-2 text-gray-400 hover:text-white transition-colors"
                >
                    <ArrowLeft className="w-5 h-5" />
                </button>
                <div className="h-6 w-px bg-gray-800"></div>
                <div>
                    <input
                        value={courseTitle}
                        onChange={(e) => setCourseTitle(e.target.value)}
                        className="bg-transparent text-sm font-bold text-white uppercase tracking-tight focus:outline-none focus:ring-1 focus:ring-blue-500/50 rounded px-1 -mx-1"
                    />
                    <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">Course Draft • ID: {courseId || 'New'}</p>
                </div>
            </div>

            <div className="flex items-center gap-3">
                <button
                    onClick={onPreview}
                    className="flex items-center gap-2 px-4 py-2 text-xs font-bold text-gray-400 hover:text-white transition-colors"
                >
                    <Eye className="w-4 h-4" />
                    Preview
                </button>
                <button
                    onClick={() => onSave(false)}
                    disabled={isSaving}
                    className="flex items-center gap-2 px-4 py-2 text-xs font-bold text-blue-400 bg-blue-500/10 border border-blue-500/20 rounded-lg hover:bg-blue-500/20 transition-colors disabled:opacity-50"
                >
                    {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                    Save Draft
                </button>
                <button
                    onClick={() => onSave(true)}
                    disabled={isSaving}
                    className="flex items-center gap-2 px-6 py-2 text-xs font-black text-white bg-blue-600 rounded-lg hover:bg-blue-700 shadow-lg shadow-blue-900/20 transition-all uppercase tracking-widest disabled:opacity-50"
                >
                    <Globe className="w-4 h-4" />
                    Publish
                </button>
            </div>
        </header>
    );
};
