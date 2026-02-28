import React from 'react';
import { FileUp } from 'lucide-react';
import type { Lesson } from './StudioTypes';
// @ts-ignore - Missing types for react-player
import ReactPlayerImport from 'react-player';
import { getVideoUrl } from '../../utils/videoUtils';
const ReactPlayer = ReactPlayerImport as any;

interface VideoEditorProps {
    lesson: Lesson;
    uploadProgress?: number;
    onUpdate: (updates: Partial<Lesson>) => void;
    onVideoUpload: (file: File) => void;
}

export const VideoEditor: React.FC<VideoEditorProps> = ({
    lesson,
    uploadProgress,
    onUpdate,
    onVideoUpload
}) => {
    const videoSource = getVideoUrl(lesson.video_url, lesson.video_file);

    return (
        <section className="space-y-8">
            <div className="space-y-6">
                <h3 className="text-sm font-black text-white uppercase tracking-widest">Video Content</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <label className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">Video URL (Vimeo, YouTube, or direct MP4)</label>
                        <input
                            value={lesson.video_url || ''}
                            onChange={(e) => onUpdate({ video_url: e.target.value })}
                            placeholder="https://vimeo.com/..."
                            className="w-full bg-[#0B0F1A] border border-gray-800 rounded-xl px-4 py-3 text-sm text-gray-300 focus:outline-none focus:border-blue-500/50"
                        />
                    </div>
                    <div className="space-y-4">
                        <label className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">Visibility</label>
                        <button
                            onClick={() => onUpdate({ is_preview: !lesson.is_preview })}
                            className={`flex items-center gap-3 px-4 py-3 rounded-xl border transition-all ${lesson.is_preview ? 'bg-emerald-500/10 border-emerald-500/50 text-emerald-400' : 'bg-[#0B0F1A] border-gray-800 text-gray-500'}`}
                        >
                            <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center transition-all ${lesson.is_preview ? 'border-emerald-400 bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.5)]' : 'border-gray-700'}`}>
                                {lesson.is_preview && <div className="w-1.5 h-1.5 bg-white rounded-full" />}
                            </div>
                            <span className="text-xs font-bold">Free Preview Available</span>
                        </button>
                    </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <label className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">Duration (HH:MM:SS)</label>
                        <input
                            value={lesson.duration || ''}
                            onChange={(e) => onUpdate({ duration: e.target.value })}
                            placeholder="00:15:30"
                            className="w-full bg-[#0B0F1A] border border-gray-800 rounded-xl px-4 py-3 text-sm text-gray-300 focus:outline-none focus:border-blue-500/50"
                        />
                    </div>
                </div>
            </div>

            <div className="relative group/upload">
                <input
                    type="file"
                    accept="video/*"
                    onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) onVideoUpload(file);
                    }}
                    className="absolute inset-0 opacity-0 cursor-pointer z-20"
                />
                <div className={`aspect-video bg-[#0B0F1A] border-2 border-dashed border-gray-800 rounded-3xl flex flex-col items-center justify-center text-center p-12 group-hover/upload:border-blue-500/50 transition-colors relative overflow-hidden ${videoSource ? 'border-blue-600/50' : ''}`}>
                    <div className="absolute inset-0 bg-blue-600/[0.02] group-hover/upload:bg-blue-600/[0.05] transition-colors" />

                    {uploadProgress !== undefined ? (
                        <div className="relative z-10 w-full max-w-xs space-y-4">
                            <div className="flex items-center justify-between text-xs font-bold text-blue-400 uppercase tracking-widest">
                                <span>Uploading Video...</span>
                                <span>{uploadProgress}%</span>
                            </div>
                            <div className="h-2 w-full bg-gray-800 rounded-full overflow-hidden">
                                <div
                                    className="h-full bg-blue-600 transition-all duration-300"
                                    style={{ width: `${uploadProgress}%` }}
                                />
                            </div>
                        </div>
                    ) : videoSource ? (
                        <div className="absolute inset-0 w-full h-full z-10">
                            <ReactPlayer
                                url={videoSource}
                                width="100%"
                                height="100%"
                                controls
                            />
                            <div className="absolute top-4 right-4 z-20">
                                <p className="px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] font-black uppercase tracking-widest rounded-full backdrop-blur-md">
                                    Video Active
                                </p>
                            </div>
                            {/* Hover Overlay for Changing Video */}
                            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover/upload:opacity-100 transition-opacity flex flex-col items-center justify-center pointer-events-none">
                                <FileUp className="w-10 h-10 text-white mb-2" />
                                <p className="text-white font-bold text-sm">Drop here to replace video</p>
                            </div>
                        </div>
                    ) : (
                        <div className="relative z-10">
                            <div className="w-20 h-20 bg-blue-600/10 rounded-full flex items-center justify-center mx-auto mb-6 group-hover/upload:scale-110 transition-transform border border-blue-500/20">
                                <FileUp className="w-8 h-8 text-blue-500" />
                            </div>
                            <h4 className="text-xl font-bold text-white mb-2">Drag & Drop Lesson Video</h4>
                            <p className="text-sm text-gray-500 max-w-xs mx-auto font-medium">MP4, WebM or MOV up to 2GB</p>
                        </div>
                    )}
                </div>
            </div>
        </section>
    );
};
