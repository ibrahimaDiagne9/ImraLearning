import React, { useRef, useState } from 'react';
import { X, Upload, Check, Loader2, Image as ImageIcon } from 'lucide-react';

interface AvatarPickerModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSelect: (file: File | null, presetUrl: string | null) => void;
    currentAvatarUrl?: string;
    username: string;
}

export const AvatarPickerModal: React.FC<AvatarPickerModalProps> = ({
    isOpen,
    onClose,
    onSelect,
    currentAvatarUrl,
    username
}) => {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [selectedPreset, setSelectedPreset] = useState<string | null>(null);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [isProcessing, setIsProcessing] = useState(false);

    // Generate ~6 preset avatars using DiceBear styles based on username or random strings
    const presets = [
        `https://api.dicebear.com/7.x/avataaars/svg?seed=${username}`,
        `https://api.dicebear.com/7.x/avataaars/svg?seed=Felix&style=circle`,
        `https://api.dicebear.com/7.x/avataaars/svg?seed=Aneka&style=circle`,
        `https://api.dicebear.com/7.x/avataaars/svg?seed=Jocelyn&style=circle`,
        `https://api.dicebear.com/7.x/avataaars/svg?seed=Mason&style=circle`,
        `https://api.dicebear.com/7.x/avataaars/svg?seed=Avery&style=circle`
    ];

    if (!isOpen) return null;

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setSelectedFile(file);
            setSelectedPreset(null);
            setPreviewUrl(URL.createObjectURL(file));
        }
    };

    const handlePresetSelect = (url: string) => {
        setSelectedPreset(url);
        setSelectedFile(null);
        setPreviewUrl(url);
    };

    const handleConfirm = async () => {
        setIsProcessing(true);
        if (selectedFile) {
            onSelect(selectedFile, null);
        } else if (selectedPreset) {
            onSelect(null, selectedPreset);
        } else {
            onClose(); // No changes
        }
    };

    // Determine what to show in the main preview circle
    const displayUrl = previewUrl || currentAvatarUrl || presets[0];

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

            <div className="relative bg-[#1f2937] border border-gray-700 rounded-2xl w-full max-w-md shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                {/* Header */}
                <div className="p-6 border-b border-gray-800 flex items-center justify-between bg-[#111827]">
                    <h2 className="text-xl font-bold text-white">Choose Avatar</h2>
                    <button
                        onClick={onClose}
                        className="p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <div className="p-6 space-y-8">
                    {/* Main Preview Container */}
                    <div className="flex flex-col items-center justify-center space-y-4">
                        <div className="relative w-32 h-32 rounded-full border-4 border-[#1f2937] shadow-lg overflow-hidden bg-gray-800 flex items-center justify-center">
                            {displayUrl ? (
                                <img src={displayUrl} alt="Preview" className="w-full h-full object-cover" />
                            ) : (
                                <ImageIcon className="w-12 h-12 text-gray-500" />
                            )}

                            {/* Overlay connecting to physical upload */}
                            <button
                                onClick={() => fileInputRef.current?.click()}
                                className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity"
                            >
                                <Upload className="w-8 h-8 text-white" />
                            </button>
                        </div>
                        <div className="flex flex-col items-center">
                            <span className="text-sm font-medium text-gray-300">Preview</span>
                            <span className="text-xs text-gray-500 mt-1">Click the image to upload a custom photo</span>
                        </div>
                    </div>

                    <div className="h-px w-full bg-gray-800" />

                    {/* Presets Grid */}
                    <div className="space-y-3">
                        <span className="text-sm font-medium text-gray-400">Or choose a preset style:</span>
                        <div className="grid grid-cols-3 gap-4">
                            {presets.map((url, idx) => (
                                <button
                                    key={idx}
                                    onClick={() => handlePresetSelect(url)}
                                    className={`relative aspect-square rounded-xl overflow-hidden border-2 transition-all ${selectedPreset === url
                                            ? 'border-blue-500 scale-105'
                                            : 'border-transparent hover:border-gray-600 bg-gray-800/50'
                                        }`}
                                >
                                    <img src={url} alt={`Preset ${idx + 1}`} className="w-full h-full object-cover p-2" />
                                    {selectedPreset === url && (
                                        <div className="absolute inset-0 bg-blue-500/20 flex items-center justify-center">
                                            <div className="bg-blue-500 rounded-full p-1 border-2 border-[#1f2937]">
                                                <Check className="w-4 h-4 text-white" />
                                            </div>
                                        </div>
                                    )}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Hidden Native Input */}
                    <input
                        type="file"
                        ref={fileInputRef}
                        className="hidden"
                        accept="image/png, image/jpeg, image/webp"
                        onChange={handleFileChange}
                    />
                </div>

                {/* Footer */}
                <div className="p-6 border-t border-gray-800 bg-[#111827] flex justify-end gap-3">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 text-sm font-medium text-gray-400 hover:text-white transition-colors"
                        disabled={isProcessing}
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleConfirm}
                        disabled={isProcessing || (!selectedFile && !selectedPreset)}
                        className="flex items-center justify-center gap-2 px-6 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-medium rounded-lg transition-colors"
                    >
                        {isProcessing ? (
                            <>
                                <Loader2 className="w-4 h-4 animate-spin" />
                                Applying...
                            </>
                        ) : (
                            'Save Avatar'
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
};
