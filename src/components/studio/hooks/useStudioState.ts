import { useState, useCallback } from 'react';
import type { Section, Lesson, LessonType } from '../StudioTypes';

export const useStudioState = (initialSections: Section[] = []) => {
    const [sections, setSections] = useState<Section[]>(initialSections);
    const [activeLessonId, setActiveLessonId] = useState<number | string | null>(null);

    const toggleSection = useCallback((id: number | string) => {
        setSections(prev => prev.map(s => s.id === id ? { ...s, isOpen: !s.isOpen } : s));
    }, []);

    const addSection = useCallback(() => {
        const newSection: Section = {
            id: `temp-s${Date.now()}`,
            title: 'Untitled Section',
            order: sections.length,
            isOpen: true,
            lessons: []
        };
        setSections(prev => [...prev, newSection]);
    }, [sections.length]);

    const addLesson = useCallback((sectionId: number | string) => {
        setSections(prev => prev.map(s => {
            if (s.id === sectionId) {
                const newLesson: Lesson = {
                    id: `temp-l${Date.now()}`,
                    title: 'New Lesson',
                    lesson_type: 'video',
                    order: s.lessons.length
                };
                return { ...s, lessons: [...s.lessons, newLesson], isOpen: true };
            }
            return s;
        }));
    }, []);

    const updateSectionTitle = useCallback((sectionId: number | string, newTitle: string) => {
        setSections(prev => prev.map(s => s.id === sectionId ? { ...s, title: newTitle } : s));
    }, []);

    const deleteSection = useCallback((sectionId: number | string) => {
        setSections(prev => prev.filter(s => s.id !== sectionId));
    }, []);

    const deleteLesson = useCallback((lessonId: number | string) => {
        setSections(prev => prev.map(s => ({
            ...s,
            lessons: s.lessons.filter(l => l.id !== lessonId)
        })));
        setActiveLessonId(prev => prev === lessonId ? null : prev);
    }, []);

    const moveSection = useCallback((index: number, direction: 'up' | 'down') => {
        setSections(prev => {
            const next = [...prev];
            const targetIndex = direction === 'up' ? index - 1 : index + 1;
            if (targetIndex < 0 || targetIndex >= next.length) return prev;
            [next[index], next[targetIndex]] = [next[targetIndex], next[index]];
            return next;
        });
    }, []);

    const moveLesson = useCallback((sectionId: number | string, lessonIndex: number, direction: 'up' | 'down') => {
        setSections(prev => prev.map(s => {
            if (s.id === sectionId) {
                const nextLessons = [...s.lessons];
                const targetIndex = direction === 'up' ? lessonIndex - 1 : lessonIndex + 1;
                if (targetIndex < 0 || targetIndex >= nextLessons.length) return s;
                [nextLessons[lessonIndex], nextLessons[targetIndex]] = [nextLessons[targetIndex], nextLessons[lessonIndex]];
                return { ...s, lessons: nextLessons };
            }
            return s;
        }));
    }, []);

    const updateLesson = useCallback((lessonId: number | string, updates: Partial<Lesson>) => {
        setSections(prev => prev.map(s => ({
            ...s,
            lessons: s.lessons.map(l => l.id === lessonId ? { ...l, ...updates } : l)
        })));
    }, []);

    const setLessonType = useCallback((lessonId: number | string, type: LessonType) => {
        setSections(prev => prev.map(s => ({
            ...s,
            lessons: s.lessons.map(l => {
                if (l.id === lessonId) {
                    const updates: Partial<Lesson> = { lesson_type: type };
                    if (type === 'quiz' && !l.quiz) {
                        updates.quiz = { title: l.title, xp_reward: 100, questions: [] };
                    }
                    if (type === 'assignment' && !l.assignment) {
                        updates.assignment = { instructions: '', total_points: 100 };
                    }
                    return { ...l, ...updates };
                }
                return l;
            })
        })));
    }, []);

    return {
        sections,
        setSections,
        activeLessonId,
        setActiveLessonId,
        toggleSection,
        addSection,
        addLesson,
        updateSectionTitle,
        deleteSection,
        deleteLesson,
        moveSection,
        moveLesson,
        updateLesson,
        setLessonType
    };
};
