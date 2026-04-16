import { useEffect, useRef, useCallback } from 'react';
import ReactPlayerImport from 'react-player';
const ReactPlayer = ReactPlayerImport as any;
import { Sparkles, Info, X, ExternalLink } from 'lucide-react';
import { VideoControls } from '../VideoControls';
import { getVideoUrl, getVideoSourceType } from '../../../utils/videoUtils';
import type { Lesson } from '../../../hooks/useLessonPlayer';

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
    const nativeVideoRef = useRef<HTMLVideoElement>(null);
    
    if (!lesson) return null;
    const videoUrl = getVideoUrl(lesson);
    const videoType = videoUrl ? getVideoSourceType(videoUrl) : 'file';
    const isExternalPlayer = videoType === 'youtube' || videoType === 'vimeo';

    console.log('🎥 [CinemaPlayer] URL:', videoUrl, '| Type:', videoType);

    // Clean YouTube URLs - strip list/radio params that break embeds
    const cleanVideoUrl = (url: string | null) => {
        if (!url) return url;
        try {
            if (url.includes('youtube.com') || url.includes('youtu.be')) {
                const parsed = new URL(url);
                const videoId = parsed.searchParams.get('v');
                if (videoId) {
                    return `https://www.youtube.com/watch?v=${videoId}`;
                }
            }
        } catch {}
        return url;
    };
    const resolvedUrl = cleanVideoUrl(videoUrl);

    // ─── Native video controls ─────────────────────────────────────────────
    useEffect(() => {
        const vid = nativeVideoRef.current;
        if (!vid || isExternalPlayer) return;
        vid.volume = volume;
        vid.muted = muted;
        vid.playbackRate = playbackRate;
    }, [volume, muted, playbackRate, isExternalPlayer]);

    useEffect(() => {
        const vid = nativeVideoRef.current;
        if (!vid || isExternalPlayer) return;
        if (isPlaying) {
            vid.play().catch(() => setIsPlaying(false));
        } else {
            vid.pause();
        }
    }, [isPlaying, isExternalPlayer, setIsPlaying]);

    // Reset on lesson change
    useEffect(() => {
        setPlaybackError(null);
        setIsLoading(true);
        setPlayed(0);
        const timer = setTimeout(() => setIsLoading(false), 15000);
        return () => clearTimeout(timer);
    }, [lesson?.id, setPlaybackError, setIsLoading, setPlayed]);

    // Expose native video ref through playerRef for seek
    useEffect(() => {
        if (nativeVideoRef.current && !isExternalPlayer) {
            playerRef.current = {
                seekTo: (fraction: number) => {
                    const vid = nativeVideoRef.current;
                    if (vid && vid.duration) vid.currentTime = fraction * vid.duration;
                },
                getInternalPlayer: () => nativeVideoRef.current,
            };
        }
    }, [isExternalPlayer, playerRef]);

    const handleNativeTimeUpdate = useCallback(() => {
        const vid = nativeVideoRef.current;
        if (!vid || !vid.duration) return;
        setPlayed(vid.currentTime / vid.duration);
    }, [setPlayed]);

    const handleNativeError = useCallback(() => {
        const vid = nativeVideoRef.current;
        let code = vid?.error?.code;
        const msgs: Record<number, string> = {
            1: 'Playback aborted (Code 1)',
            2: 'Network error while loading (Code 2)',
            3: 'Decode failed — video format may not be supported (Code 3)',
            4: 'Video source not found or format unsupported (Code 4)',
        };
        const detail = code ? msgs[code] || `Unknown error (Code ${code})` : 'Unknown error';
        setPlaybackError(detail);
        setIsLoading(false);
    }, [setPlaybackError, setIsLoading]);

    // ─── No video ─────────────────────────────────────────────────────────
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

    return (
        <div className="group relative w-full h-full bg-black overflow-hidden select-none">

            {/* ── Native <video> for self-hosted MP4 files ─────────────────── */}
            {!isExternalPlayer && (
                <video
                    ref={nativeVideoRef}
                    key={videoUrl}
                    src={videoUrl}
                    crossOrigin="anonymous"
                    playsInline
                    preload="metadata"
                    style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', objectFit: 'contain' }}
                    onLoadedMetadata={() => {
                        const vid = nativeVideoRef.current;
                        if (vid) setDuration(vid.duration);
                        setIsLoading(false);
                    }}
                    onCanPlay={() => setIsLoading(false)}
                    onWaiting={() => setIsLoading(true)}
                    onPlaying={() => { setIsLoading(false); setIsPlaying(true); }}
                    onPause={() => setIsPlaying(false)}
                    onEnded={onEnded}
                    onTimeUpdate={handleNativeTimeUpdate}
                    onError={handleNativeError}
                />
            )}

            {/* ── ReactPlayer for YouTube / Vimeo ──────────────────────────── */}
            {isExternalPlayer && (
                <ReactPlayer
                    key={lesson.id}
                    ref={playerRef}
                    url={resolvedUrl!}
                    width="100%"
                    height="100%"
                    playing={isPlaying}
                    volume={volume}
                    muted={muted}
                    playbackRate={playbackRate}
                    style={{ position: 'absolute', top: 0, left: 0 }}
                    playsinline
                    config={{
                        youtube: {
                            playerVars: { showinfo: 0, rel: 0, modestbranding: 1 }
                        }
                    } as any}
                    onBuffer={() => setIsLoading(true)}
                    onBufferEnd={() => setIsLoading(false)}
                    onReady={() => setIsLoading(false)}
                    onDuration={setDuration}
                    onProgress={(p: any) => setPlayed(p.played)}
                    onPlay={() => setIsPlaying(true)}
                    onPause={() => setIsPlaying(false)}
                    onEnded={onEnded}
                    onError={(e: any) => {
                        // Ignore AbortError - it's browser noise when React mounts/unmounts
                        const isAbort = e?.message?.includes('abort') || e?.name === 'AbortError';
                        if (isAbort) {
                            console.warn('[CinemaPlayer] YouTube: AbortError (ignored, browser noise)');
                            return;
                        }
                        console.error('ReactPlayer Error:', e);
                        setPlaybackError('External video failed to load. The link may be private or unsupported.');
                    }}
                />
            )}

            {/* ── Loading Spinner ───────────────────────────────────────────── */}
            {isLoading && !playbackError && (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/40 backdrop-blur-sm transition-all z-10 pointer-events-none">
                    <div className="relative">
                        <div className="w-16 h-16 border-2 border-blue-500/20 border-t-blue-500 rounded-full animate-spin" />
                        <Sparkles className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-6 h-6 text-blue-500 animate-pulse" />
                    </div>
                </div>
            )}

            {/* ── Error Overlay ─────────────────────────────────────────────── */}
            {playbackError && (
                <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-10 space-y-4 bg-black/90 backdrop-blur-md z-20">
                    <div className="w-16 h-16 bg-red-500/10 rounded-2xl flex items-center justify-center border border-red-500/10">
                        <X className="w-8 h-8 text-red-500" />
                    </div>
                    <h3 className="text-xl font-bold text-white mb-2">Playback Failed</h3>
                    <p className="text-gray-400 max-w-xs mx-auto mb-4 font-medium">{playbackError}</p>

                    {/* Diagnostic Info */}
                    <div className="bg-white/5 border border-white/10 rounded-xl p-4 max-w-lg mx-auto text-left">
                        <p className="text-[10px] text-gray-500 uppercase tracking-widest font-bold mb-2">Diagnostic Data</p>
                        <div className="space-y-1 font-mono text-[10px] text-gray-400">
                            <p><span className="text-blue-500">SOURCE:</span> {resolvedUrl}</p>
                            <p><span className="text-blue-500">TYPE:</span> {lesson.lesson_type} ({videoType})</p>
                            <div className="pt-2">
                                <a
                                    href={videoUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-blue-400 hover:text-blue-300 underline font-bold flex items-center gap-1"
                                >
                                    <ExternalLink className="w-3 h-3" />
                                    Open Direct Link in New Tab
                                </a>
                            </div>
                        </div>
                    </div>

                    <button
                        onClick={() => { setPlaybackError(null); setIsLoading(true); setIsPlaying(true); }}
                        className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-all"
                    >
                        Retry Playback
                    </button>
                </div>
            )}

            {/* ── Video Controls ────────────────────────────────────────────── */}
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
                    if (nativeVideoRef.current && nativeVideoRef.current.duration) {
                        nativeVideoRef.current.currentTime = v * nativeVideoRef.current.duration;
                    } else {
                        playerRef.current?.seekTo(v);
                    }
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
