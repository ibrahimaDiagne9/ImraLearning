import React, { useState } from 'react';
import type { Lesson } from './StudioTypes';

interface ArticleEditorProps {
    lesson: Lesson;
    onUpdate: (updates: Partial<Lesson>) => void;
}

export const ArticleEditor: React.FC<ArticleEditorProps> = ({
    lesson,
    onUpdate
}) => {
    const [previewMode, setPreviewMode] = useState(false);

    return (
        <section className="space-y-6">
            <div className="flex items-center justify-between">
                <h3 className="text-sm font-black text-white uppercase tracking-widest">Article Content</h3>
                <div className="flex bg-gray-900 p-1 rounded-lg">
                    <button
                        onClick={() => setPreviewMode(false)}
                        className={`px-4 py-1.5 rounded-md text-[10px] font-black uppercase tracking-widest transition-all ${!previewMode ? 'bg-blue-600 text-white shadow-lg' : 'text-gray-500 hover:text-gray-300'}`}
                    >
                        Edit
                    </button>
                    <button
                        onClick={() => setPreviewMode(true)}
                        className={`px-4 py-1.5 rounded-md text-[10px] font-black uppercase tracking-widest transition-all ${previewMode ? 'bg-blue-600 text-white shadow-lg' : 'text-gray-500 hover:text-gray-300'}`}
                    >
                        Preview
                    </button>
                </div>
            </div>

            {previewMode ? (
                <div className="bg-[#0B0F1A] border border-gray-800 rounded-3xl p-8 min-h-[400px] article-preview">
                    {lesson.content ? (
                        <div dangerouslySetInnerHTML={{ __html: lesson.content.replace(/\n/g, '<br/>') }} />
                    ) : (
                        <p className="text-gray-600 italic">No content to preview.</p>
                    )}
                </div>
            ) : (
                <div className="bg-[#0B0F1A] border border-gray-800 rounded-3xl p-1 w-full min-h-[400px]">
                    <textarea
                        value={lesson.content || ''}
                        onChange={(e) => onUpdate({ content: e.target.value })}
                        placeholder="Start writing your lesson content here..."
                        className="w-full h-full min-h-[390px] bg-transparent p-8 text-gray-300 leading-relaxed focus:outline-none resize-none font-medium"
                    />
                </div>
            )}
        </section>
    );
};
