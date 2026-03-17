import { useEffect } from 'react';
import ReactPlayerImport from 'react-player';
import { Sparkles, Info, X } from 'lucide-react';
import { VideoControls } from '../VideoControls';
import { getVideoUrl } from '../../../utils/videoUtils';
import type { Lesson } from '../../../hooks/useLessonPlayer';

const ReactPlayer = ReactPlayerImport as any;

interface CinemaPlayerProps {
    lesson: Lesson;
    isPlaying: boolean;
    setIsPlaying: (p: boolean) => void;
    volume: number;
    setVolume: (v: number) => void;
    muted: boolean;
    setMuted: (m: boolean) => void;
    playbackRate: number;
    setPlaybackRate: (r: number) => void;
    duration: number;
    setDuration: (d: number) => void;
    played: number;
    setPlayed: (p: number) => void;
    isLoading: boolean;
    setIsLoading: (l: boolean) => void;
    playbackError: string | null;
    setPlaybackError: (e: string | null) => void;
    onToggleFullscreen: () => void;
    onEnded: () => void;
    playerRef: any;
}

export const CinemaPlayer = ({
    lesson,
    isPlaying,
    setIsPlaying,
    volume,
    setVolume,
    muted,
    setMuted,
    playbackRate,
    setPlaybackRate,
    duration,
    setDuration,
    played,
    setPlayed,
    isLoading,
    setIsLoading,
    playbackError,
    setPlaybackError,
    onToggleFullscreen,
    onEnded,
    playerRef
}: CinemaPlayerProps) => {
    useEffect(() => {
        if (!lesson) return;
        setPlaybackError(null);
        setIsLoading(true);
        setPlayed(0);

        // Safety timeout: if video doesn't load in 10s, release the UI so clicks can reach the player
        const timer = setTimeout(() => {
            setIsLoading(false);
        }, 10000);

        return () => clearTimeout(timer);
    }, [lesson?.id, setPlaybackError, setIsLoading, setPlayed]);

    // Sync native video props since they aren't fully supported declaratively
    useEffect(() => {
        const videoElement = playerRef.current;
        if (videoElement && videoElement.tagName === 'VIDEO') {
            videoElement.volume = volume;
            videoElement.muted = muted;
            videoElement.playbackRate = playbackRate;

            if (isPlaying && videoElement.paused) {
                videoElement.play().catch((e: any) => console.error("Play failed:", e));
            } else if (!isPlaying && !videoElement.paused) {
                videoElement.pause();
            }
        }
    }, [volume, muted, playbackRate, isPlaying, playerRef]);

    if (!lesson) return null;
    const videoUrl = getVideoUrl(lesson.video_url, lesson.video_file);

    if (!videoUrl) {
        return (
            <div className="flex flex-col items-center justify-center text-center p-20 space-y-4 bg-[#0A0D14] h-full">
                <div className="w-16 h-16 bg-gray-500/10 rounded-2xl flex items-center justify-center border border-gray-500/10">
                    <Info className="w-8 h-8 text-gray-500" />
                </div>
                <h3 className="text-xl font-bold text-white mb-2">No Video Available</h3>
                <p className="text-gray-400 max-w-xs mx-auto mb-4">The instructor hasn't provided a video for this lesson yet.</p>
            </div>
        );
    }

    // Instead of returning early on error, render over the player so we can retry properly



    return (
        <div className="group relative w-full h-full bg-black overflow-hidden select-none">
            <ReactPlayer
                ref={playerRef}
                url={videoUrl}
                width="100%"
                height="100%"
                playing={isPlaying}
                volume={volume}
                muted={muted}
                playbackRate={playbackRate}
                style={{ position: 'absolute', top: 0, left: 0 }}
                playsinline
                config={{
                    file: {
                        forceVideo: true,
                        attributes: {
                            controlsList: 'nodownload',
                            crossOrigin: 'anonymous',
                            style: { width: '100%', height: '100%', objectFit: 'contain' }
                        },
                    },
                    youtube: {
                        playerVars: { showinfo: 0, rel: 0, modestbranding: 1 }
                    }
                }}
                onBuffer={() => setIsLoading(true)}
                onBufferEnd={() => setIsLoading(false)}
                onReady={() => {
                    setIsLoading(false);
                    // Sync initial state if needed
                    if (playerRef.current) {
                        const internal = playerRef.current.getInternalPlayer();
                        if (internal && internal.tagName === 'VIDEO') {
                            internal.volume = volume;
                            internal.muted = muted;
                        }
                    }
                }}
                onDuration={setDuration}
                onProgress={(p: any) => setPlayed(p.played)}
                onPlay={() => setIsPlaying(true)}
                onPause={() => setIsPlaying(false)}
                onEnded={onEnded}
                onError={(e: any) => {
                    console.error("Player Error:", e);
                    setPlaybackError("Failed to play video. Source might be unavailable or format unsupported.");
                }}
            />

            {isLoading && !playbackError && (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/40 backdrop-blur-sm transition-all z-10 pointer-events-none">
                    <div className="relative">
                        <div className="w-16 h-16 border-2 border-blue-500/20 border-t-blue-500 rounded-full animate-spin" />
                        <Sparkles className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-6 h-6 text-blue-500 animate-pulse" />
                    </div>
                </div>
            )}

            {playbackError && (
                <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-20 space-y-4 bg-black/90 backdrop-blur-md z-20">
                    <div className="w-16 h-16 bg-red-500/10 rounded-2xl flex items-center justify-center border border-red-500/10">
                        <X className="w-8 h-8 text-red-500" />
                    </div>
                    <h3 className="text-xl font-bold text-white mb-2">Playback Failed</h3>
                    <p className="text-gray-400 max-w-xs mx-auto mb-8">{playbackError}</p>
                    <p className="text-xs text-gray-500 mb-4 font-mono break-all">{videoUrl}</p>
                    <button
                        onClick={() => { setPlaybackError(null); setIsLoading(true); setIsPlaying(true); }}
                        className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-all relative z-30"
                    >
                        Try Reconnect
                    </button>
                </div>
            )}

            <VideoControls
                isPlaying={isPlaying}
                duration={duration}
                played={played}
                volume={volume}
                muted={muted}
                playbackRate={playbackRate}
                onTogglePlay={() => setIsPlaying(!isPlaying)}
                onSeek={(v) => {
                    setPlayed(v);
                    playerRef.current?.seekTo(v);
                }}
                onVolumeChange={(v) => {
                    setVolume(v);
                    localStorage.setItem('video_volume', v.toString());
                }}
                onToggleMute={() => setMuted(!muted)}
                onToggleFullscreen={onToggleFullscreen}
                onPlaybackRateChange={setPlaybackRate}
                title={lesson.title}
            />
        </div>
    );
};
