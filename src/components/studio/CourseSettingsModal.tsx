import { X, Save, Globe, Sliders, DollarSign, Clock, Layers } from 'lucide-react';

interface CourseSettingsModalProps {
    isOpen: boolean;
    onClose: () => void;
    data: {
        description: string;
        category: string;
        level: string;
        price: string;
        durationHours: string;
    };
    onUpdate: (field: string, value: any) => void;
    onSave: () => void;
    isSaving: boolean;
}

export const CourseSettingsModal = ({ isOpen, onClose, data, onUpdate, onSave, isSaving }: CourseSettingsModalProps) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-[#020617]/90 backdrop-blur-md" onClick={onClose} />

            <div className="relative w-full max-w-2xl bg-[#0B0F1A] border border-gray-800 rounded-3xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-300">
                {/* Header */}
                <div className="px-8 py-6 border-b border-gray-800 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-blue-600/10 rounded-xl flex items-center justify-center border border-blue-500/20">
                            <Sliders className="w-5 h-5 text-blue-500" />
                        </div>
                        <div>
                            <h2 className="text-xl font-black text-white uppercase tracking-tight">Course Settings</h2>
                            <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">Visibility, Pricing & Metadata</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-2 text-gray-500 hover:text-white transition-colors">
                        <X className="w-6 h-6" />
                    </button>
                </div>

                {/* Content */}
                <div className="p-8 space-y-8 max-h-[70vh] overflow-y-auto custom-scrollbar">
                    {/* Description */}
                    <div className="space-y-3">
                        <label className="text-[10px] text-gray-500 font-black uppercase tracking-widest block">Course Description</label>
                        <textarea
                            value={data.description}
                            onChange={(e) => onUpdate('description', e.target.value)}
                            placeholder="Tell your students what they will learn..."
                            className="w-full h-32 bg-[#020617] border border-gray-800 rounded-2xl p-4 text-sm text-gray-300 focus:outline-none focus:border-blue-500/50 transition-all resize-none"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-8">
                        {/* Category */}
                        <div className="space-y-3">
                            <label className="text-[10px] text-gray-500 font-black uppercase tracking-widest block text-left">Category</label>
                            <input
                                value={data.category}
                                onChange={(e) => onUpdate('category', e.target.value)}
                                placeholder="e.g. Design, Development"
                                className="w-full bg-[#020617] border border-gray-800 rounded-2xl px-5 py-4 text-sm text-gray-300 focus:outline-none focus:border-blue-500/50 transition-all"
                            />
                        </div>

                        {/* Level */}
                        <div className="space-y-3">
                            <label className="text-[10px] text-gray-500 font-black uppercase tracking-widest block text-left">Difficulty Level</label>
                            <div className="relative">
                                <Layers className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-600" />
                                <select
                                    value={data.level}
                                    onChange={(e) => onUpdate('level', e.target.value)}
                                    className="w-full bg-[#020617] border border-gray-800 rounded-2xl pl-12 pr-5 py-4 text-sm text-gray-300 focus:outline-none focus:border-blue-500/50 transition-all appearance-none cursor-pointer"
                                >
                                    <option value="beginner">Beginner</option>
                                    <option value="intermediate">Intermediate</option>
                                    <option value="advanced">Advanced</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-8">
                        {/* Price */}
                        <div className="space-y-3">
                            <label className="text-[10px] text-gray-500 font-black uppercase tracking-widest block text-left">Price (USD)</label>
                            <div className="relative">
                                <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-600" />
                                <input
                                    type="number"
                                    value={data.price}
                                    onChange={(e) => onUpdate('price', e.target.value)}
                                    placeholder="0.00"
                                    step="0.01"
                                    className="w-full bg-[#020617] border border-gray-800 rounded-2xl pl-12 pr-5 py-4 text-sm text-gray-300 focus:outline-none focus:border-blue-500/50 transition-all"
                                />
                            </div>
                        </div>

                        {/* Duration */}
                        <div className="space-y-3">
                            <label className="text-[10px] text-gray-500 font-black uppercase tracking-widest block text-left">Est. Duration (Hours)</label>
                            <div className="relative">
                                <Clock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-600" />
                                <input
                                    type="number"
                                    value={data.durationHours}
                                    onChange={(e) => onUpdate('durationHours', e.target.value)}
                                    placeholder="0"
                                    className="w-full bg-[#020617] border border-gray-800 rounded-2xl pl-12 pr-5 py-4 text-sm text-gray-300 focus:outline-none focus:border-blue-500/50 transition-all"
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="px-8 py-6 bg-[#0B0F1A]/50 border-t border-gray-800 flex items-center justify-end gap-4">
                    <button
                        onClick={onClose}
                        className="px-6 py-3 text-xs font-bold text-gray-400 hover:text-white transition-colors uppercase tracking-widest"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={onSave}
                        disabled={isSaving}
                        className="px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl text-xs font-black uppercase tracking-widest transition-all shadow-lg shadow-blue-900/40 disabled:opacity-50 flex items-center gap-2"
                    >
                        {isSaving ? <Globe className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                        Apply Changes
                    </button>
                </div>
            </div>
        </div>
    );
};
