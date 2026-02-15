import { ChevronDown, ChevronRight, Plus, Trash2, ArrowUp, ArrowDown } from 'lucide-react';
import React from 'react';

interface SectionItemProps {
    title: string;
    isOpen: boolean;
    onToggle: () => void;
    onAddLesson: () => void;
    onRename: (newTitle: string) => void;
    onDelete: () => void;
    onMoveUp?: () => void;
    onMoveDown?: () => void;
    children: React.ReactNode;
}

export const SectionItem = ({
    title,
    isOpen,
    onToggle,
    onAddLesson,
    onRename,
    onDelete,
    onMoveUp,
    onMoveDown,
    children
}: SectionItemProps) => {
    return (
        <div className="space-y-2">
            <div className="flex items-center justify-between group cursor-pointer" onClick={onToggle}>
                <div className="flex items-center gap-2 flex-1">
                    <div className="w-6 h-6 flex items-center justify-center text-gray-500">
                        {isOpen ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                    </div>
                    <input
                        value={title}
                        onClick={(e) => e.stopPropagation()}
                        onChange={(e) => onRename(e.target.value)}
                        className="text-[10px] font-black text-gray-500 hover:text-white uppercase tracking-widest bg-transparent border-none focus:outline-none focus:ring-1 focus:ring-blue-500/30 rounded px-1 transition-colors w-full"
                    />
                </div>
                <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            onMoveUp?.();
                        }}
                        className="p-1 hover:bg-white/5 rounded text-gray-500 hover:text-blue-400 transition-colors"
                        title="Move Up"
                    >
                        <ArrowUp className="w-3 h-3" />
                    </button>
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            onMoveDown?.();
                        }}
                        className="p-1 hover:bg-white/5 rounded text-gray-500 hover:text-blue-400 transition-colors"
                        title="Move Down"
                    >
                        <ArrowDown className="w-3 h-3" />
                    </button>
                    <div className="w-px h-3 bg-gray-800 mx-1"></div>
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            onAddLesson();
                        }}
                        className="p-1.5 hover:bg-white/5 rounded-md text-gray-500 hover:text-blue-400 transition-colors"
                        title="Add Lesson"
                    >
                        <Plus className="w-3.5 h-3.5" />
                    </button>
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            if (window.confirm('Delete this section and all its lessons?')) {
                                onDelete();
                            }
                        }}
                        className="p-1.5 hover:bg-white/5 rounded-md text-gray-500 hover:text-red-400 transition-colors"
                        title="Delete Section"
                    >
                        <Trash2 className="w-3.5 h-3.5" />
                    </button>
                </div>
            </div>

            {isOpen && (
                <div className="space-y-1 ml-4 border-l border-gray-800 pl-2">
                    {children}
                </div>
            )}
        </div>
    );
};
