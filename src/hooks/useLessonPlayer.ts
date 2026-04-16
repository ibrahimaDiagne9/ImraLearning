import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import api from '../services/api';

export interface Lesson {
    id: number;
    title: string;
    lesson_type: 'video' | 'article' | 'quiz' | 'assignment';
    video_url?: string;
    video_file?: string;
    video_file_url?: string;
    content?: string;
    duration?: string;
    is_completed: boolean;
    is_preview: boolean;
}

export interface Section {
    id: number;
    title: string;
    lessons: Lesson[];
}

export interface Course {
    id: number;
    title: string;
    sections: Section[];
    progress_percentage: number;
}

export const useLessonPlayer = (course: Course | null, initialLessonId?: number | null) => {
    const [activeLessonId, setActiveLessonId] = useState<number | null>(initialLessonId || null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [playbackError, setPlaybackError] = useState<string | null>(null);
    const [duration, setDuration] = useState(0);
    const [played, setPlayed] = useState(0);
    const [volume, setVolume] = useState(() => parseFloat(localStorage.getItem('video_volume') || '0.8'));
    const [muted, setMuted] = useState(false);
    const [playbackRate, setPlaybackRate] = useState(1);
    const [isSidebarOpen, setIsSidebarOpen] = useState(window.innerWidth > 1024);
    const [isCinemaMode, setIsCinemaMode] = useState(true);

    const playerRef = useRef<any>(null);

    // Derived State
    const allLessons = useMemo(() => {
        if (!course || !Array.isArray(course.sections)) return [];
        return course.sections.flatMap(s => Array.isArray(s.lessons) ? s.lessons : []);
    }, [course]);

    const activeLesson = useMemo(() => {
        if (allLessons.length === 0) return null;
        const found = allLessons.find(l => l.id === activeLessonId);
        return found || allLessons[0] || null;
    }, [allLessons, activeLessonId]);

    const activeLessonIndex = useMemo(() => {
        if (!activeLesson || allLessons.length === 0) return -1;
        return allLessons.findIndex(l => l.id === activeLesson.id);
    }, [allLessons, activeLesson]);

    // Actions
    const handleNext = useCallback(() => {
        if (activeLessonIndex < allLessons.length - 1) {
            setActiveLessonId(allLessons[activeLessonIndex + 1].id);
            setIsPlaying(true);
            setPlayed(0);
            return true;
        }
        return false;
    }, [allLessons, activeLessonIndex]);

    const handlePrev = useCallback(() => {
        if (activeLessonIndex > 0) {
            setActiveLessonId(allLessons[activeLessonIndex - 1].id);
            setIsPlaying(true);
            setPlayed(0);
            return true;
        }
        return false;
    }, [allLessons, activeLessonIndex]);

    const togglePlayback = useCallback(() => setIsPlaying(prev => !prev), []);

    const toggleMute = useCallback(() => setMuted(prev => !prev), []);

    const toggleCinemaMode = useCallback(() => setIsCinemaMode(prev => !prev), []);

    const toggleSidebar = useCallback(() => setIsSidebarOpen(prev => !prev), []);

    const handleSeek = useCallback((amount: number) => {
        if (playerRef.current) {
            const currentTime = playerRef.current.getCurrentTime();
            playerRef.current.seekTo(currentTime + amount, 'seconds');
        }
    }, []);

    // API Actions
    const toggleCompletion = useCallback(async () => {
        if (!activeLesson) return;
        try {
            const response = await api.post(`/lessons/${activeLesson.id}/toggle-completion/`);
            return response.data.is_completed;
        } catch (error) {
            console.error('Failed to toggle completion:', error);
            throw error;
        }
    }, [activeLesson]);

    // Keyboard Shortcuts
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (document.activeElement?.tagName === 'TEXTAREA' || document.activeElement?.tagName === 'INPUT') return;

            switch (e.code) {
                case 'Space':
                    e.preventDefault();
                    togglePlayback();
                    break;
                case 'KeyM':
                    toggleMute();
                    break;
                case 'KeyC':
                    toggleCinemaMode();
                    break;
                case 'KeyB':
                    toggleSidebar();
                    break;
                case 'ArrowRight':
                    handleSeek(10);
                    break;
                case 'ArrowLeft':
                    handleSeek(-10);
                    break;
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [togglePlayback, toggleMute, toggleCinemaMode, toggleSidebar, handleSeek]);

    return {
        // State
        activeLesson,
        activeLessonId,
        setActiveLessonId,
        isPlaying,
        setIsPlaying,
        isLoading,
        setIsLoading,
        playbackError,
        setPlaybackError,
        duration,
        setDuration,
        played,
        setPlayed,
        volume,
        setVolume,
        muted,
        setMuted,
        playbackRate,
        setPlaybackRate,
        isSidebarOpen,
        setIsSidebarOpen,
        isCinemaMode,
        setIsCinemaMode,
        playerRef,

        // Derived
        allLessons,
        activeLessonIndex,
        hasPrev: activeLessonIndex > 0,
        hasNext: activeLessonIndex < allLessons.length - 1,

        // Actions
        handleNext,
        handlePrev,
        togglePlayback,
        toggleMute,
        toggleCinemaMode,
        toggleSidebar,
        toggleCompletion,
        handleSeek
    };
};
