import type { ToastType } from '../components/ui/Toast';

type ToastListener = (message: string, type: ToastType) => void;
let listener: ToastListener | null = null;

export const toast = {
    subscribe: (l: ToastListener) => {
        listener = l;
        return () => { listener = null; };
    },
    show: (message: string, type: ToastType = 'success') => {
        if (listener) listener(message, type);
    },
    error: (message: string) => {
        if (listener) listener(message, 'error');
    },
    success: (message: string) => {
        if (listener) listener(message, 'success');
    },
    warning: (message: string) => {
        if (listener) listener(message, 'warning');
    },
    info: (message: string) => {
        if (listener) listener(message, 'info');
    }
};
