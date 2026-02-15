import React from 'react';
import { Plus, Paperclip, Trash2 } from 'lucide-react';
import type { Resource } from './StudioTypes';

interface ResourceListProps {
    resources: Resource[];
    onAddResource: (file: File) => void;
    onDeleteResource: (resourceId: number) => void;
}

export const ResourceList: React.FC<ResourceListProps> = ({
    resources,
    onAddResource,
    onDeleteResource
}) => {
    return (
        <section className="space-y-6">
            <div className="flex items-center justify-between">
                <h3 className="text-sm font-black text-white uppercase tracking-widest">Attached Resources</h3>
                <div className="relative">
                    <input
                        type="file"
                        onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) onAddResource(file);
                        }}
                        className="absolute inset-0 opacity-0 cursor-pointer z-10"
                    />
                    <button className="flex items-center gap-2 text-xs font-bold text-blue-400 hover:text-blue-300 transition-colors bg-blue-500/5 px-4 py-2 rounded-lg border border-blue-500/10">
                        <Plus className="w-3.5 h-3.5" />
                        Add Resource
                    </button>
                </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {resources.map(resource => (
                    <div key={resource.id} className="p-5 bg-[#0B0F1A] border border-gray-800 rounded-2xl flex items-center justify-between group hover:border-gray-700 transition-colors">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-gray-800/50 rounded-xl">
                                <Paperclip className="w-5 h-5 text-gray-400" />
                            </div>
                            <div>
                                <p className="text-sm font-bold text-white truncate max-w-[150px]">{resource.title}</p>
                                <p className="text-[10px] text-gray-600 font-bold uppercase tracking-wider">{resource.file_size} • {resource.file_type?.toUpperCase()}</p>
                            </div>
                        </div>
                        <button
                            onClick={() => onDeleteResource(resource.id)}
                            className="p-2 text-gray-600 hover:text-red-400 transition-colors"
                        >
                            <Trash2 className="w-4 h-4" />
                        </button>
                    </div>
                ))}
                {resources.length === 0 && (
                    <div className="col-span-2 py-8 border border-dashed border-gray-800 rounded-2xl text-center">
                        <p className="text-xs text-gray-500 font-bold uppercase tracking-widest">No resources attached to this lesson.</p>
                    </div>
                )}
            </div>
        </section>
    );
};
