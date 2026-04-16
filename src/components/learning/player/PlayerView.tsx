import { Menu, Maximize2 } from 'lucide-react';
import { useLessonPlayer } from '../../../hooks/useLessonPlayer';
import type { Course } from '../../../hooks/useLessonPlayer';
import { PlayerSidebar } from './PlayerSidebar';
import { CinemaPlayer } from './CinemaPlayer';
import { PlayerControlsBar } from './PlayerControlsBar';
import { PlayerContent } from './PlayerContent';

interface PlayerViewProps {
    course: Course;
    initialLessonId?: number | null;
    onBack: () => void;
    setCourse: (c: any) => void;
}

export const PlayerView = ({ course, initialLessonId, onBack, setCourse }: PlayerViewProps) => {
    const player = useLessonPlayer(course, initialLessonId);

    const handleToggleCompletion = async () => {
        try {
            const is_completed = await player.toggleCompletion();
            setCourse((prev: any) => ({
                ...prev,
                sections: prev.sections.map((s: any) => ({
                    ...s,
                    lessons: s.lessons.map((l: any) =>
                        l.id === player.activeLessonId ? { ...l, is_completed } : l
                    )
                }))
            }));
        } catch (error) {
            // Error already logged in hook
        }
    };

    const handleToggleFullscreen = () => {
        const elem = document.querySelector('.player-container');
        if (!elem) return;
        if (!document.fullscreenElement) {
            elem.requestFullscreen().catch(err => console.error(err));
        } else {
            document.exitFullscreen();
        }
    };

    return (
        <div className="h-screen bg-[#0A0D14] text-white flex overflow-hidden font-sans">
            <PlayerSidebar
                course={course}
                activeLessonId={player.activeLessonId}
                setActiveLessonId={player.setActiveLessonId}
                isOpen={player.isSidebarOpen}
                onPlay={() => player.setIsPlaying(true)}
            />

            <main className="flex-1 flex flex-col relative bg-black min-w-0 player-container">
                {/* Header */}
                <header className="h-20 px-6 flex items-center justify-between border-b border-white/5 shrink-0 bg-[#0A0D14]/80 backdrop-blur-md z-20">
                    <div className="flex items-center gap-6">
                        <button
                            onClick={() => player.toggleSidebar()}
                            className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center hover:bg-white/10 transition-all text-white active:scale-95"
                        >
                            <Menu className="w-5 h-5" />
                        </button>

                        <div className="flex items-center gap-3 bg-[#0B0F1A] border border-white/5 px-4 py-2 rounded-xl">
                            <div className="flex flex-col">
                                <span className="text-[10px] font-black text-blue-500 uppercase tracking-tighter italic">NEURAL STREAM</span>
                                <span className="text-xs font-bold text-white truncate max-w-[200px]">{course.title}</span>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => player.toggleCinemaMode()}
                            className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all
                            ${player.isCinemaMode ? 'bg-blue-600/10 text-blue-500 border border-blue-500/20' : 'bg-gray-800 text-gray-400'}`}
                        >
                            <Maximize2 className="w-5 h-5" />
                        </button>
                        <button
                            onClick={onBack}
                            className="px-6 py-2 bg-gray-800 hover:bg-white/10 text-white rounded-xl text-xs font-bold transition-all uppercase tracking-widest border border-white/5"
                        >
                            Exit
                        </button>
                    </div>
                </header>

                {/* Sub-Header / Current Lesson Info (Non-Cinema) */}
                {!player.isCinemaMode && (
                    <div className="bg-[#0B0F1A] border-b border-white/5 px-8 py-4 shrink-0">
                        <h1 className="text-2xl font-black text-white">{player.activeLesson?.title}</h1>
                        <p className="text-gray-500 text-sm mt-1">Lesson {player.activeLessonIndex + 1} of {player.allLessons.length}</p>
                    </div>
                )}

                {/* Main Content Area */}
                <div className="flex-1 relative overflow-y-auto custom-scrollbar-hidden bg-[#07090F]">
                    {player.allLessons.length > 0 ? (
                        <div className={`${player.isCinemaMode ? 'h-full w-full' : 'max-w-6xl mx-auto py-8 px-6'}`}>
                            {player.activeLesson?.lesson_type === 'video' ? (
                                <div className={`${player.isCinemaMode ? 'absolute inset-0 bg-black' : 'aspect-video rounded-3xl overflow-hidden bg-black shadow-2xl shadow-blue-500/10 border border-white/5'}`}>
                                    <CinemaPlayer
                                        lesson={player.activeLesson}
                                        isPlaying={player.isPlaying}
                                        setIsPlaying={player.setIsPlaying}
                                        volume={player.volume}
                                        setVolume={player.setVolume}
                                        muted={player.muted}
                                        setMuted={player.setMuted}
                                        playbackRate={player.playbackRate}
                                        setPlaybackRate={player.setPlaybackRate}
                                        duration={player.duration}
                                        setDuration={player.setDuration}
                                        played={player.played}
                                        setPlayed={player.setPlayed}
                                        isLoading={player.isLoading}
                                        setIsLoading={player.setIsLoading}
                                        playbackError={player.playbackError}
                                        setPlaybackError={player.setPlaybackError}
                                        onToggleFullscreen={handleToggleFullscreen}
                                        onEnded={player.handleNext}
                                        playerRef={player.playerRef}
                                    />
                                </div>
                            ) : (
                                <div className="flex-1">
                                    {player.activeLesson && (
                                        <PlayerContent
                                            lesson={player.activeLesson}
                                            isCinemaMode={player.isCinemaMode}
                                        />
                                    )}
                                </div>
                            )}

                            {/* Additional Content (when not in cinema mode) */}
                            {!player.isCinemaMode && player.activeLesson?.lesson_type === 'video' && player.activeLesson && (
                                <PlayerContent
                                    lesson={player.activeLesson}
                                    isCinemaMode={false}
                                />
                            )}
                        </div>
                    ) : (
                        <div className="h-full flex flex-col items-center justify-center p-12 text-center space-y-4">
                            <div className="w-16 h-16 bg-blue-500/10 rounded-2xl flex items-center justify-center border border-blue-500/10 mb-2">
                                <Menu className="w-8 h-8 text-blue-500/40" />
                            </div>
                            <h3 className="text-xl font-bold text-white">No content yet</h3>
                            <p className="text-gray-500 max-w-xs mx-auto">This course doesn't have any lessons in the curriculum yet. Please check back later.</p>
                            <button onClick={onBack} className="px-6 py-2 bg-white/5 hover:bg-white/10 text-white rounded-xl text-xs font-bold transition-all uppercase tracking-widest border border-white/5">
                                Return to Overview
                            </button>
                        </div>
                    )}
                </div>

                {/* Control Bar */}
                {player.activeLesson && (
                    <PlayerControlsBar
                        lesson={player.activeLesson}
                        hasPrev={player.hasPrev}
                        hasNext={player.hasNext}
                        onPrev={player.handlePrev}
                        onNext={player.handleNext}
                        onToggleCompletion={handleToggleCompletion}
                    />
                )}
            </main>
        </div>
    );
};
