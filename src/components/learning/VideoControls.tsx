import React from 'react';
import {
    Play, Pause, Volume2, VolumeX, Maximize2
} from 'lucide-react';

interface VideoControlsProps {
    isPlaying: boolean;
    duration: number;
    played: number;
    volume: number;
    muted: boolean;
    playbackRate: number;
    onTogglePlay: () => void;
    onSeek: (value: number) => void;
    onVolumeChange: (value: number) => void;
    onToggleMute: () => void;
    onToggleFullscreen: () => void;
    onPlaybackRateChange: (rate: number) => void;
    title?: string;
}

export const VideoControls: React.FC<VideoControlsProps> = ({
    isPlaying,
    duration,
    played,
    volume,
    muted,
    playbackRate,
    onTogglePlay,
    onSeek,
    onVolumeChange,
    onToggleMute,
    onToggleFullscreen,
    onPlaybackRateChange,
    title
}) => {
    const formatTime = (seconds: number) => {
        const date = new Date(seconds * 1000);
        const hh = date.getUTCHours();
        const mm = date.getUTCMinutes();
        const ss = date.getUTCSeconds().toString().padStart(2, '0');
        if (hh) {
            return `${hh}:${mm.toString().padStart(2, '0')}:${ss}`;
        }
        return `${mm}:${ss}`;
    };

    return (
        <div className="absolute inset-0 flex flex-col justify-end bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
            {/* Top Title Overlay */}
            <div className="absolute top-0 inset-x-0 p-6 flex justify-between items-start">
                <div className="flex flex-col gap-1">
                    <span className="text-[10px] font-black text-blue-500 uppercase tracking-widest bg-blue-500/10 px-2 py-0.5 rounded-md self-start border border-blue-500/20">
                        NOW PLAYING
                    </span>
                    <h4 className="text-white font-bold text-lg drop-shadow-lg">{title}</h4>
                </div>
            </div>

            {/* Bottom Controls */}
            <div className="p-6 pt-0 space-y-4 pointer-events-auto">
                {/* Progress Bar */}
                <div className="group/progress relative h-2 w-full flex items-center">
                    <input
                        type="range"
                        min={0}
                        max={0.999999}
                        step="any"
                        value={played}
                        onChange={(e) => onSeek(parseFloat(e.target.value))}
                        className="absolute inset-0 w-full h-1 bg-white/20 rounded-full appearance-none cursor-pointer accent-blue-500 group-hover/progress:h-2 transition-all"
                    />
                    <div
                        className="absolute top-1/2 -translate-y-1/2 left-0 h-1 bg-blue-600 rounded-full pointer-events-none group-hover/progress:h-2 transition-all"
                        style={{ width: `${played * 100}%` }}
                    />
                </div>

                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-6">
                        <button onClick={onTogglePlay} className="text-white hover:text-blue-400 transition-colors">
                            {isPlaying ? <Pause className="w-6 h-6 fill-current" /> : <Play className="w-6 h-6 fill-current" />}
                        </button>

                        <div className="flex items-center gap-2 group/volume">
                            <button onClick={onToggleMute} className="text-white hover:text-blue-400">
                                {muted || volume === 0 ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
                            </button>
                            <div className="w-0 group-hover/volume:w-20 overflow-hidden transition-all duration-300 flex items-center h-5">
                                <input
                                    type="range"
                                    min={0}
                                    max={1}
                                    step="any"
                                    value={volume}
                                    onChange={(e) => onVolumeChange(parseFloat(e.target.value))}
                                    className="w-full h-1 bg-white/20 rounded-full appearance-none cursor-pointer accent-white"
                                />
                            </div>
                        </div>

                        <span className="text-xs font-mono text-white/80 tabular-nums">
                            {formatTime(played * duration)} / {formatTime(duration)}
                        </span>
                    </div>

                    <div className="flex items-center gap-4">
                        <div className="relative group/rate">
                            <button className="text-[10px] font-black text-white px-2 py-1 rounded bg-white/10 hover:bg-white/20 transition-all uppercase tracking-tighter">
                                {playbackRate}x
                            </button>
                            <div className="absolute bottom-full right-0 mb-2 invisible group-hover/rate:visible bg-black/90 backdrop-blur-xl border border-white/10 rounded-xl overflow-hidden shadow-2xl transition-all">
                                {[0.5, 0.75, 1, 1.25, 1.5, 2].map(rate => (
                                    <button
                                        key={rate}
                                        onClick={() => onPlaybackRateChange(rate)}
                                        className={`w-full px-4 py-2 text-[10px] font-bold text-left hover:bg-blue-600 transition-all
                                        ${playbackRate === rate ? 'text-blue-500 bg-blue-500/10' : 'text-gray-400'}`}
                                    >
                                        {rate}x
                                    </button>
                                ))}
                            </div>
                        </div>

                        <button onClick={onToggleFullscreen} className="text-white hover:text-blue-400 transition-colors">
                            <Maximize2 className="w-5 h-5" />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};
