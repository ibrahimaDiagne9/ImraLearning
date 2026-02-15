import React from 'react';
import { Plus, Trash2, CheckCircle2, XCircle } from 'lucide-react';
import type { Lesson, Quiz } from './StudioTypes';

interface QuizEditorProps {
    lesson: Lesson;
    onUpdate: (updates: Partial<Lesson>) => void;
}

export const QuizEditor: React.FC<QuizEditorProps> = ({
    lesson,
    onUpdate
}) => {
    if (!lesson.quiz) return null;

    const handleQuizUpdate = (updates: Partial<Quiz>) => {
        onUpdate({
            quiz: { ...lesson.quiz!, ...updates }
        });
    };

    const addQuestion = () => {
        const quiz = lesson.quiz!;
        handleQuizUpdate({
            questions: [
                ...quiz.questions,
                {
                    id: `temp-q-${Date.now()}`,
                    text: '',
                    choices: [{ id: `temp-c-1-${Date.now()}`, text: '', is_correct: true }],
                    explanation: ''
                }
            ]
        });
    };

    return (
        <section className="space-y-8">
            <div className="flex items-center justify-between">
                <h3 className="text-sm font-black text-white uppercase tracking-widest">Quiz Builder</h3>
                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                        <label className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">XP Reward</label>
                        <input
                            type="number"
                            value={lesson.quiz.xp_reward}
                            onChange={(e) => handleQuizUpdate({ xp_reward: parseInt(e.target.value) || 0 })}
                            className="w-20 bg-[#0B0F1A] border border-gray-800 rounded-lg px-3 py-1.5 text-xs text-blue-400 font-bold"
                        />
                    </div>
                </div>
            </div>

            <div className="space-y-6">
                {lesson.quiz.questions.map((question, qIndex) => (
                    <div key={question.id} className="bg-[#0B0F1A] border border-gray-800 rounded-3xl p-8 space-y-6 relative group/q">
                        <button
                            onClick={() => {
                                handleQuizUpdate({
                                    questions: lesson.quiz!.questions.filter(q => q.id !== question.id)
                                });
                            }}
                            className="absolute top-6 right-6 p-2 text-gray-700 hover:text-red-400 transition-colors opacity-0 group-hover/q:opacity-100"
                        >
                            <Trash2 className="w-4 h-4" />
                        </button>

                        <div className="space-y-2">
                            <label className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">Question {qIndex + 1}</label>
                            <textarea
                                value={question.text}
                                onChange={(e) => {
                                    handleQuizUpdate({
                                        questions: lesson.quiz!.questions.map(q => q.id === question.id ? { ...q, text: e.target.value } : q)
                                    });
                                }}
                                placeholder="What is your question?"
                                className="w-full bg-transparent text-xl font-bold text-white focus:outline-none placeholder:text-gray-800 resize-none"
                            />
                        </div>

                        <div className="space-y-3">
                            <label className="text-[10px] text-gray-500 font-bold uppercase tracking-widest flex items-center justify-between">
                                Choices
                                <span className="text-gray-700 italic lowercase font-medium">mark correct with checkmark</span>
                            </label>
                            {question.choices.map((choice, cIndex) => (
                                <div key={choice.id} className="flex items-center gap-3 group/c">
                                    <button
                                        onClick={() => {
                                            handleQuizUpdate({
                                                questions: lesson.quiz!.questions.map(q => q.id === question.id ? {
                                                    ...q,
                                                    choices: q.choices.map(c => ({ ...c, is_correct: c.id === choice.id }))
                                                } : q)
                                            });
                                        }}
                                        className={`p-1.5 rounded-lg transition-all ${choice.is_correct ? 'bg-emerald-500/20 text-emerald-400' : 'bg-gray-800 text-gray-600 hover:text-gray-400'}`}
                                    >
                                        <CheckCircle2 className="w-4 h-4" />
                                    </button>
                                    <input
                                        value={choice.text}
                                        onChange={(e) => {
                                            handleQuizUpdate({
                                                questions: lesson.quiz!.questions.map(q => q.id === question.id ? {
                                                    ...q,
                                                    choices: q.choices.map(c => c.id === choice.id ? { ...c, text: e.target.value } : c)
                                                } : q)
                                            });
                                        }}
                                        placeholder={`Choice ${cIndex + 1}`}
                                        className="flex-1 bg-[#1A1F2E] border border-gray-800/50 rounded-xl px-4 py-2.5 text-sm text-gray-300 focus:outline-none focus:border-blue-500/30"
                                    />
                                    <button
                                        onClick={() => {
                                            handleQuizUpdate({
                                                questions: lesson.quiz!.questions.map(q => q.id === question.id ? {
                                                    ...q,
                                                    choices: q.choices.filter(c => c.id !== choice.id)
                                                } : q)
                                            });
                                        }}
                                        className="p-2 text-gray-700 hover:text-red-400 transition-colors opacity-0 group-hover/c:opacity-100"
                                    >
                                        <XCircle className="w-3.5 h-3.5" />
                                    </button>
                                </div>
                            ))}
                            <button
                                onClick={() => {
                                    handleQuizUpdate({
                                        questions: lesson.quiz!.questions.map(q => q.id === question.id ? {
                                            ...q,
                                            choices: [...q.choices, { id: `temp-c-${Date.now()}`, text: '', is_correct: false }]
                                        } : q)
                                    });
                                }}
                                className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-blue-400/60 hover:text-blue-400 transition-colors mt-2"
                            >
                                <Plus className="w-3 h-3" />
                                Add Choice
                            </button>
                        </div>

                        <div className="space-y-2 pt-4 border-t border-gray-800/30">
                            <label className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">Explanation (Optional)</label>
                            <input
                                value={question.explanation || ''}
                                onChange={(e) => {
                                    handleQuizUpdate({
                                        questions: lesson.quiz!.questions.map(q => q.id === question.id ? { ...q, explanation: e.target.value } : q)
                                    });
                                }}
                                placeholder="Explain why the correct answer is right..."
                                className="w-full bg-transparent border-b border-gray-800 py-2 text-sm text-gray-400 focus:outline-none focus:border-blue-500/30 font-medium"
                            />
                        </div>
                    </div>
                ))}

                <button
                    onClick={addQuestion}
                    className="w-full py-8 border-2 border-dashed border-gray-800 rounded-3xl flex flex-col items-center justify-center gap-3 text-gray-600 hover:border-blue-500/30 hover:text-blue-400 transition-all transition-all group overflow-hidden relative"
                >
                    <div className="absolute inset-0 bg-blue-600/[0.01] group-hover:bg-blue-600/[0.03] transition-colors" />
                    <div className="w-12 h-12 bg-gray-900 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform relative z-10">
                        <Plus className="w-6 h-6" />
                    </div>
                    <span className="text-[10px] font-black uppercase tracking-widest relative z-10">Add Question to Quiz</span>
                </button>
            </div>
        </section>
    );
};
