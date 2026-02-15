import { useState } from 'react';
import { CheckCircle2, XCircle, ArrowRight, Trophy, Sparkles, RefreshCcw, Loader2 } from 'lucide-react';
import { submitQuiz } from '../../services/api';

interface Choice {
    id: number;
    text: string;
    is_correct: boolean;
}

interface Question {
    id: number;
    text: string;
    choices: Choice[];
    explanation: string;
}

interface Quiz {
    id: number;
    title: string;
    xp_reward: number;
    questions: Question[];
}

interface QuizComponentProps {
    quiz: Quiz;
}

interface QuizResult {
    score: number;
    total_questions: number;
    xp_rewarded: number;
}

export const QuizComponent = ({ quiz }: QuizComponentProps) => {
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [selectedChoiceId, setSelectedChoiceId] = useState<number | null>(null);
    const [isAnswered, setIsAnswered] = useState(false);
    const [answers, setAnswers] = useState<{ [key: number]: number }>({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [result, setResult] = useState<QuizResult | null>(null);

    const currentQuestion = quiz.questions[currentQuestionIndex];

    const handleChoiceSelect = (choiceId: number) => {
        if (isAnswered) return;
        setSelectedChoiceId(choiceId);
    };

    const handleCheckAnswer = () => {
        if (selectedChoiceId === null) return;

        setAnswers(prev => ({
            ...prev,
            [currentQuestion.id]: selectedChoiceId
        }));
        setIsAnswered(true);
    };

    const handleNext = async () => {
        if (currentQuestionIndex < quiz.questions.length - 1) {
            setCurrentQuestionIndex(prev => prev + 1);
            setSelectedChoiceId(null);
            setIsAnswered(false);
        } else {
            await handleSubmit();
        }
    };

    const handleSubmit = async () => {
        setIsSubmitting(true);
        try {
            // Include the last answer since state update might be async
            const finalAnswers = {
                ...answers,
                [currentQuestion.id]: selectedChoiceId!
            };
            const response = await submitQuiz(quiz.id, finalAnswers);
            setResult(response);
        } catch (error) {
            console.error('Quiz submission failed:', error);
        } finally {
            setIsSubmitting(false);
        }
    };

    const resetQuiz = () => {
        setCurrentQuestionIndex(0);
        setSelectedChoiceId(null);
        setIsAnswered(false);
        setAnswers({});
        setResult(null);
    };

    if (result) {
        const passed = (result.score / result.total_questions) >= 0.6;
        return (
            <div className="bg-[#111827] border border-gray-800 rounded-3xl p-12 text-center animate-in zoom-in duration-500 max-w-2xl mx-auto my-12 shadow-2xl shadow-blue-900/10">
                <div className="w-24 h-24 bg-blue-600/10 rounded-full flex items-center justify-center mx-auto mb-8 relative">
                    {passed ? (
                        <>
                            <Trophy className="w-12 h-12 text-blue-500" />
                            <Sparkles className="absolute -top-2 -right-2 w-8 h-8 text-yellow-500 animate-pulse" />
                        </>
                    ) : (
                        <RefreshCcw className="w-12 h-12 text-gray-500" />
                    )}
                </div>

                <h2 className="text-3xl font-black text-white mb-4 tracking-tight">
                    {passed ? (result.score === result.total_questions ? 'Perfect Score!' : 'Quiz Passed!') : 'Keep Practicing!'}
                </h2>
                <p className="text-gray-400 mb-8 font-medium">
                    {passed
                        ? `Great job! You've mastered this lesson and earned ${result.xp_rewarded} XP.`
                        : `You scored ${result.score} out of ${result.total_questions}. A score of 60% is needed to pass and earn XP!`}
                </p>

                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <button
                        onClick={resetQuiz}
                        className="bg-gray-800 hover:bg-gray-700 text-white px-8 py-4 rounded-2xl font-bold transition-all flex items-center justify-center gap-2"
                    >
                        <RefreshCcw className="w-5 h-5" />
                        Try Again
                    </button>
                    {passed && (
                        <button
                            className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-2xl font-bold transition-all shadow-lg shadow-blue-500/20"
                        >
                            Next Lesson
                        </button>
                    )}
                </div>
            </div>
        );
    }

    if (!currentQuestion) return null;

    return (
        <div className="max-w-3xl mx-auto py-8">
            {/* Progress Header */}
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h3 className="text-xl font-bold text-white mb-1">{quiz.title || 'Interactive Quiz'}</h3>
                    <p className="text-xs text-gray-500 font-bold uppercase tracking-widest">Question {currentQuestionIndex + 1} of {quiz.questions?.length || 0}</p>
                </div>
                <div className="text-right">
                    <span className="text-blue-400 font-black text-lg">+{quiz.xp_reward} XP</span>
                    <p className="text-[10px] text-gray-600 font-bold uppercase tracking-widest">Available Reward</p>
                </div>
            </div>

            {/* Progress Bar */}
            <div className="h-1.5 w-full bg-gray-800 rounded-full mb-12 overflow-hidden">
                <div
                    className="h-full bg-blue-600 transition-all duration-500 shadow-[0_0_12px_rgba(59,130,246,0.3)]"
                    style={{ width: `${((currentQuestionIndex + 1) / (quiz.questions?.length || 1)) * 100}%` }}
                />
            </div>

            {/* Question Card */}
            <div className="bg-[#111827] border border-gray-800 rounded-3xl p-10 mb-8 relative overflow-hidden group">
                <div className="absolute top-0 left-0 w-1 h-full bg-blue-600 opacity-50 group-hover:opacity-100 transition-opacity" />
                <h4 className="text-xl font-medium text-white mb-10 leading-relaxed">
                    {currentQuestion.text}
                </h4>

                <div className="space-y-4">
                    {currentQuestion.choices.map((choice) => {
                        const isSelected = selectedChoiceId === choice.id;
                        const isCorrect = isAnswered && choice.is_correct;
                        const isWrong = isAnswered && isSelected && !choice.is_correct;

                        return (
                            <button
                                key={choice.id}
                                onClick={() => handleChoiceSelect(choice.id)}
                                disabled={isAnswered}
                                className={`w-full p-5 rounded-2xl border text-left transition-all duration-300 flex items-center justify-between group/opt ${isCorrect
                                    ? 'bg-emerald-500/10 border-emerald-500/50 text-emerald-400'
                                    : isWrong
                                        ? 'bg-red-500/10 border-red-500/50 text-red-400'
                                        : isSelected
                                            ? 'bg-blue-600/10 border-blue-500 text-blue-400'
                                            : 'bg-[#1F2937]/50 border-gray-800 text-gray-400 hover:border-gray-600'
                                    }`}
                            >
                                <span className="font-medium">{choice.text}</span>
                                {isCorrect && <CheckCircle2 className="w-5 h-5" />}
                                {isWrong && <XCircle className="w-5 h-5" />}
                                {!isAnswered && (
                                    <div className={`w-6 h-6 rounded-full border-2 flex-shrink-0 transition-all ${isSelected ? 'bg-blue-600 border-blue-600 shadow-[0_0_8px_rgba(59,130,246,0.5)]' : 'border-gray-700 group-hover/opt:border-gray-500'
                                        }`} />
                                )}
                            </button>
                        );
                    })}
                </div>

                {isAnswered && (
                    <div className="mt-8 p-6 bg-blue-600/5 border border-blue-500/10 rounded-2xl animate-in slide-in-from-top-4 duration-500">
                        <p className="text-sm font-bold text-blue-400 mb-1 flex items-center gap-2">
                            <Sparkles className="w-4 h-4" /> Explanation
                        </p>
                        <p className="text-sm text-gray-400 leading-relaxed font-medium">
                            {currentQuestion.explanation || "No further explanation provided."}
                        </p>
                    </div>
                )}
            </div>

            {/* Actions */}
            <div className="flex justify-end">
                {!isAnswered ? (
                    <button
                        onClick={handleCheckAnswer}
                        disabled={selectedChoiceId === null}
                        className={`px-10 py-4 rounded-2xl font-bold transition-all shadow-xl ${selectedChoiceId !== null
                            ? 'bg-blue-600 text-white hover:bg-blue-700 shadow-blue-500/20'
                            : 'bg-gray-800 text-gray-500 cursor-not-allowed border border-gray-700'
                            }`}
                    >
                        Check Answer
                    </button>
                ) : (
                    <button
                        onClick={handleNext}
                        disabled={isSubmitting}
                        className="bg-white text-black hover:bg-gray-200 px-10 py-4 rounded-2xl font-bold transition-all flex items-center gap-2 shadow-xl shadow-white/5"
                    >
                        {isSubmitting ? (
                            <>
                                <Loader2 className="w-5 h-5 animate-spin" />
                                Submitting...
                            </>
                        ) : (
                            <>
                                {currentQuestionIndex < (quiz.questions?.length || 0) - 1 ? 'Next Question' : 'Finish Quiz'}
                                <ArrowRight className="w-5 h-5" />
                            </>
                        )}
                    </button>
                )}
            </div>
        </div>
    );
};
