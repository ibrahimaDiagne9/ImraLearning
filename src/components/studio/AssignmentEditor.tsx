import React from 'react';
import type { Lesson } from './StudioTypes';

interface AssignmentEditorProps {
    lesson: Lesson;
    onUpdate: (updates: Partial<Lesson>) => void;
}

export const AssignmentEditor: React.FC<AssignmentEditorProps> = ({
    lesson,
    onUpdate
}) => {
    if (!lesson.assignment) return null;

    const handleAssignmentUpdate = (updates: Partial<NonNullable<Lesson['assignment']>>) => {
        onUpdate({
            assignment: { ...lesson.assignment!, ...updates }
        });
    };

    return (
        <section className="space-y-8">
            <div className="space-y-6">
                <h3 className="text-sm font-black text-white uppercase tracking-widest">Assignment Details</h3>
                <div className="space-y-6">
                    <div className="space-y-2">
                        <label className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">Instructions</label>
                        <textarea
                            value={lesson.assignment.instructions}
                            onChange={(e) => handleAssignmentUpdate({ instructions: e.target.value })}
                            rows={6}
                            placeholder="Provide detailed instructions for the students..."
                            className="w-full bg-[#0B0F1A] border border-gray-800 rounded-xl px-4 py-3 text-sm text-gray-300 focus:outline-none focus:border-blue-500/50 resize-none"
                        />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">Total Points</label>
                            <input
                                type="number"
                                value={lesson.assignment.total_points}
                                onChange={(e) => handleAssignmentUpdate({ total_points: parseInt(e.target.value) || 0 })}
                                className="w-full bg-[#0B0F1A] border border-gray-800 rounded-xl px-4 py-3 text-sm text-gray-300 focus:outline-none focus:border-blue-500/50"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">Due Date (Optional)</label>
                            <input
                                type="datetime-local"
                                value={lesson.assignment.due_date ? lesson.assignment.due_date.substring(0, 16) : ''}
                                onChange={(e) => handleAssignmentUpdate({ due_date: e.target.value })}
                                className="w-full bg-[#0B0F1A] border border-gray-800 rounded-xl px-4 py-3 text-sm text-gray-300 focus:outline-none focus:border-blue-500/50 scheme-dark"
                            />
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};
