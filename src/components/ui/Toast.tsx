import { CheckCircle, XCircle, AlertCircle, X, Info } from 'lucide-react';
import { useEffect, useState } from 'react';

export type ToastType = 'success' | 'error' | 'info' | 'warning';

export interface ToastProps {
    id: string;
    message: string;
    type: ToastType;
    onClose: (id: string) => void;
}

export const Toast = ({ id, message, type, onClose }: ToastProps) => {
    const [isVisible, setIsVisible] = useState(true);

    useEffect(() => {
        const timer = setTimeout(() => {
            handleClose();
        }, 3000);
        return () => clearTimeout(timer);
    }, []);

    const handleClose = () => {
        setIsVisible(false);
        setTimeout(() => onClose(id), 300); // Wait for fade-out animation
    };

    const icons = {
        success: <CheckCircle className="w-5 h-5 text-green-400" />,
        error: <XCircle className="w-5 h-5 text-red-400" />,
        info: <Info className="w-5 h-5 text-blue-400" />,
        warning: <AlertCircle className="w-5 h-5 text-yellow-400" />,
    };

    const colors = {
        success: 'border-green-500/20 bg-green-500/10 shadow-green-900/10',
        error: 'border-red-500/20 bg-red-500/10 shadow-red-900/10',
        info: 'border-blue-500/20 bg-blue-500/10 shadow-blue-900/10',
        warning: 'border-yellow-500/20 bg-yellow-500/10 shadow-yellow-900/10',
    };

    return (
        <div
            className={`flex items-center gap-3 px-4 py-3 rounded-xl border backdrop-blur-md shadow-2xl transition-all duration-300 ${colors[type]} ${isVisible ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'}`}
            style={{ maxWidth: '400px' }}
        >
            <div className="flex-shrink-0">{icons[type]}</div>
            <p className="text-sm font-medium text-white flex-grow">{message}</p>
            <button
                onClick={handleClose}
                className="text-gray-500 hover:text-white transition-colors p-1"
            >
                <X className="w-4 h-4" />
            </button>
        </div>
    );
};

export const ToastContainer = ({ children }: { children: React.ReactNode }) => {
    return (
        <div className="fixed bottom-6 right-6 z-[9999] flex flex-col gap-3 pointer-events-none">
            <div className="pointer-events-auto flex flex-col gap-3">
                {children}
            </div>
        </div>
    );
};
