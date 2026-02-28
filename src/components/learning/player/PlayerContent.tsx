import { useState } from 'react';
import { QuizComponent } from '../QuizComponent';
import type { Lesson } from '../../../hooks/useLessonPlayer';

interface PlayerContentProps {
    lesson: Lesson;
    isCinemaMode: boolean;
}

export const PlayerContent = ({ lesson, isCinemaMode }: PlayerContentProps) => {
    const [activeTab, setActiveTab] = useState<'overview' | 'resources' | 'assignment'>('overview');
    const [submissionContent, setSubmissionContent] = useState('');

    if (!lesson) return null;
    if (isCinemaMode && lesson.lesson_type === 'video') return null;

    return (
        <div className={`mt-12 ${isCinemaMode ? 'px-6 max-w-6xl mx-auto' : ''}`}>
            {lesson.lesson_type === 'quiz' ? (
                <QuizComponent quiz={(lesson as any).quiz} />
            ) : (
                <>
                    <div className="border-b border-white/5 flex gap-8 mb-8">
                        {(['overview', 'resources', 'assignment'] as const).map((tab) => (
                            <button
                                key={tab}
                                onClick={() => setActiveTab(tab)}
                                className={`pb-4 text-xs font-bold uppercase tracking-widest transition-all relative
                                ${activeTab === tab ? 'text-blue-500' : 'text-gray-500 hover:text-white'}`}
                            >
                                {tab}
                                {activeTab === tab && <div className="absolute bottom-0 inset-x-0 h-0.5 bg-blue-500" />}
                            </button>
                        ))}
                    </div>

                    <div className="min-h-[200px] mb-12">
                        {activeTab === 'overview' && (
                            <div className="text-gray-400 leading-relaxed font-sans text-lg">
                                {lesson.content || "No briefing available."}
                            </div>
                        )}
                        {activeTab === 'resources' && (
                            <div className="flex flex-col gap-4">
                                {(lesson as any).resources?.map((res: any) => (
                                    <div key={res.id} className="flex items-center justify-between p-4 bg-white/5 rounded-xl">
                                        <span className="text-sm font-bold">{res.title}</span>
                                        <a href={res.file_url || res.file} target="_blank" rel="noreferrer" className="text-blue-500 text-xs font-bold">Download</a>
                                    </div>
                                ))}
                                {!(lesson as any).resources?.length && <p className="text-gray-500 text-sm italic">No resources available.</p>}
                            </div>
                        )}
                        {activeTab === 'assignment' && (
                            <div className="bg-white/5 rounded-3xl p-8">
                                <h3 className="text-lg font-bold mb-4">Assignment Submission</h3>
                                <textarea
                                    className="w-full h-40 bg-black border border-white/10 rounded-xl p-4 text-white mb-4 focus:outline-none focus:border-blue-500"
                                    placeholder="Write your findings here..."
                                    value={submissionContent}
                                    onChange={(e) => setSubmissionContent(e.target.value)}
                                />
                                <button
                                    disabled={!submissionContent}
                                    className="px-8 py-3 bg-blue-600 text-white rounded-xl font-bold disabled:opacity-50"
                                >
                                    Submit Assignment
                                </button>
                            </div>
                        )}
                    </div>
                </>
            )}
        </div>
    );
};
