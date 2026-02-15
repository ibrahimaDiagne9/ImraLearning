import { X } from 'lucide-react';
import { useEffect } from 'react';

interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    children: React.ReactNode;
    icon?: React.ReactNode;
    maxWidth?: string;
}

export const Modal = ({ isOpen, onClose, title, children, icon, maxWidth = 'max-w-2xl' }: ModalProps) => {
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [isOpen]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div
                className="absolute inset-0 bg-black/80 backdrop-blur-sm transition-opacity"
                onClick={onClose}
            ></div>
            <div className={`bg-[#111827] border border-gray-800 rounded-2xl w-full ${maxWidth} max-h-[90vh] overflow-y-auto relative z-10 shadow-2xl animate-in fade-in zoom-in-95 duration-200`}>
                <div className="sticky top-0 bg-[#111827] border-b border-gray-800 p-6 flex items-center justify-between z-20">
                    <div className="flex items-center gap-3">
                        {icon && (
                            <div className="p-2 bg-blue-600 rounded-lg text-white">
                                {icon}
                            </div>
                        )}
                        <h2 className="text-xl font-bold text-white">{title}</h2>
                    </div>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-white transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>
                <div className="p-6">
                    {children}
                </div>
            </div>
        </div>
    );
};
