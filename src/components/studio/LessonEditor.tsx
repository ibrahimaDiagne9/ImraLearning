import React from 'react';
import { Video, FileText, HelpCircle, Sparkles, Settings, Trash2 } from 'lucide-react';
import type { Lesson, LessonType } from './StudioTypes';
import { VideoEditor } from './VideoEditor';
import { ArticleEditor } from './ArticleEditor';
import { QuizEditor } from './QuizEditor';
import { AssignmentEditor } from './AssignmentEditor';
import { ResourceList } from './ResourceList';

interface LessonEditorProps {
    lesson: Lesson;
    uploadProgress?: number;
    onUpdate: (updates: Partial<Lesson>) => void;
    onSetType: (type: LessonType) => void;
    onVideoUpload: (file: File) => void;
    onAddResource: (file: File) => void;
    onDeleteResource: (resourceId: number) => void;
    onDeleteLesson: () => void;
    onOpenSettings: () => void;
}

export const LessonEditor: React.FC<LessonEditorProps> = ({
    lesson,
    uploadProgress,
    onUpdate,
    onSetType,
    onVideoUpload,
    onAddResource,
    onDeleteResource,
    onDeleteLesson,
    onOpenSettings
}) => {
    return (
        <div className="max-w-4xl mx-auto space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Lesson Header Editor */}
            <div className="space-y-4">
                <div className="flex items-center gap-2 text-blue-400 font-bold uppercase text-[10px] tracking-widest">
                    <Sparkles className="w-3.5 h-3.5" />
                    Active Lesson Editor
                </div>
                <input
                    value={lesson.title}
                    onChange={(e) => onUpdate({ title: e.target.value })}
                    className="w-full bg-transparent text-4xl font-black text-white focus:outline-none placeholder:text-gray-800 tracking-tight"
                    placeholder="Untitled Lesson"
                />
            </div>

            {/* Lesson Type Toggle */}
            <div className="flex gap-4 p-1 bg-gray-900 rounded-xl w-fit">
                {[
                    { id: 'video' as LessonType, icon: Video, label: 'Video Lesson' },
                    { id: 'article' as LessonType, icon: FileText, label: 'Article content' },
                    { id: 'quiz' as LessonType, icon: HelpCircle, label: 'Interactive Quiz' },
                    { id: 'assignment' as LessonType, icon: FileText, label: 'Assignment' }
                ].map(type => (
                    <button
                        key={type.id}
                        onClick={() => onSetType(type.id)}
                        className={`flex items-center gap-2 px-6 py-2.5 rounded-lg text-xs font-bold transition-all ${lesson.lesson_type === type.id ? 'bg-blue-600 text-white shadow-lg' : 'text-gray-500 hover:text-gray-300'}`}
                    >
                        <type.icon className="w-4 h-4" />
                        {type.label}
                    </button>
                ))}
            </div>

            {/* Specialized Content Area */}
            {lesson.lesson_type === 'video' && (
                <VideoEditor
                    lesson={lesson}
                    uploadProgress={uploadProgress}
                    onUpdate={onUpdate}
                    onVideoUpload={onVideoUpload}
                />
            )}
            {lesson.lesson_type === 'article' && (
                <ArticleEditor
                    lesson={lesson}
                    onUpdate={onUpdate}
                />
            )}
            {lesson.lesson_type === 'quiz' && (
                <QuizEditor
                    lesson={lesson}
                    onUpdate={onUpdate}
                />
            )}
            {lesson.lesson_type === 'assignment' && (
                <AssignmentEditor
                    lesson={lesson}
                    onUpdate={onUpdate}
                />
            )}

            {/* Resources Section */}
            <ResourceList
                resources={lesson.resources || []}
                onAddResource={onAddResource}
                onDeleteResource={onDeleteResource}
            />

            {/* Settings Toolbar */}
            <div className="pt-12 border-t border-gray-800 flex gap-4">
                <button
                    onClick={onOpenSettings}
                    className="flex items-center gap-2 px-8 py-4 bg-[#111827] hover:bg-gray-800 text-white rounded-2xl text-xs font-black uppercase tracking-widest transition-all border border-gray-800"
                >
                    <Settings className="w-4 h-4" />
                    Visibility & Settings
                </button>
                <button
                    onClick={onDeleteLesson}
                    className="flex items-center gap-2 px-8 py-4 bg-red-500/10 border border-red-500/20 text-red-500 hover:bg-red-500/20 rounded-2xl text-xs font-black uppercase tracking-widest transition-all"
                >
                    <Trash2 className="w-4 h-4" />
                    Delete Lesson
                </button>
            </div>
        </div>
    );
};
