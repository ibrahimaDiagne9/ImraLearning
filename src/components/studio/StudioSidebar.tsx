import React from 'react';
import { Layout, Plus } from 'lucide-react';
import { SectionItem } from './SectionItem';
import { LessonDraftItem } from './LessonDraftItem';
import type { Section } from './StudioTypes';

interface StudioSidebarProps {
    sections: Section[];
    activeLessonId: number | string | null;
    setActiveLessonId: (id: number | string) => void;
    toggleSection: (id: number | string) => void;
    addSection: () => void;
    addLesson: (sectionId: number | string) => void;
    updateSectionTitle: (sectionId: number | string, title: string) => void;
    deleteSection: (sectionId: number | string) => void;
    deleteLesson: (lessonId: number | string) => void;
    moveSection: (index: number, direction: 'up' | 'down') => void;
    moveLesson: (sectionId: number | string, lessonIndex: number, direction: 'up' | 'down') => void;
}

export const StudioSidebar: React.FC<StudioSidebarProps> = ({
    sections,
    activeLessonId,
    setActiveLessonId,
    toggleSection,
    addSection,
    addLesson,
    updateSectionTitle,
    deleteSection,
    deleteLesson,
    moveSection,
    moveLesson
}) => {
    return (
        <aside className="w-80 lg:w-96 bg-[#0B0F1A] border-r border-gray-800 flex flex-col shadow-2xl">
            <div className="p-6 border-b border-gray-800 flex items-center justify-between bg-[#0B0F1A]/80 backdrop-blur-md">
                <h3 className="text-xs font-black text-white uppercase tracking-widest flex items-center gap-2">
                    <Layout className="w-4 h-4 text-blue-500" />
                    Curriculum
                </h3>
            </div>

            <div className="flex-1 overflow-y-auto custom-scrollbar p-6 space-y-8">
                {sections.map((section, sectionIdx) => (
                    <SectionItem
                        key={section.id}
                        title={section.title}
                        isOpen={!!section.isOpen}
                        onToggle={() => toggleSection(section.id!)}
                        onAddLesson={() => addLesson(section.id!)}
                        onRename={(newTitle) => updateSectionTitle(section.id!, newTitle)}
                        onDelete={() => deleteSection(section.id!)}
                        onMoveUp={() => moveSection(sectionIdx, 'up')}
                        onMoveDown={() => moveSection(sectionIdx, 'down')}
                    >
                        {section.lessons.map((lesson, lessonIdx) => (
                            <LessonDraftItem
                                key={lesson.id}
                                title={lesson.title}
                                type={lesson.lesson_type}
                                isActive={activeLessonId === lesson.id}
                                onClick={() => setActiveLessonId(lesson.id!)}
                                onDelete={() => deleteLesson(lesson.id!)}
                                onMoveUp={() => moveLesson(section.id!, lessonIdx, 'up')}
                                onMoveDown={() => moveLesson(section.id!, lessonIdx, 'down')}
                            />
                        ))}
                    </SectionItem>
                ))}

                {/* Add Section Button */}
                <button
                    onClick={addSection}
                    className="w-full py-4 border-2 border-dashed border-gray-800 rounded-2xl flex items-center justify-center gap-2 text-gray-600 hover:border-blue-500/30 hover:text-blue-400 transition-all group"
                >
                    <Plus className="w-4 h-4 group-hover:scale-110 transition-transform" />
                    <span className="text-[10px] font-black uppercase tracking-widest">New Section</span>
                </button>
            </div>
        </aside>
    );
};
