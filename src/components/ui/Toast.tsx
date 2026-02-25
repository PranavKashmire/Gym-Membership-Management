import React, { createContext, useContext, useState, useCallback } from 'react';
import { CheckCircle, XCircle, AlertCircle, Info, X } from 'lucide-react';
import { clsx } from '../../utils';

type ToastType = 'success' | 'error' | 'warning' | 'info';

interface Toast {
    id: string;
    type: ToastType;
    title: string;
    message?: string;
}

interface ToastContextType {
    show: (toast: Omit<Toast, 'id'>) => void;
    success: (title: string, message?: string) => void;
    error: (title: string, message?: string) => void;
    warning: (title: string, message?: string) => void;
    info: (title: string, message?: string) => void;
}

const ToastContext = createContext<ToastContextType | null>(null);

const icons = {
    success: <CheckCircle className="w-5 h-5 text-emerald-500" />,
    error: <XCircle className="w-5 h-5 text-red-500" />,
    warning: <AlertCircle className="w-5 h-5 text-amber-500" />,
    info: <Info className="w-5 h-5 text-blue-500" />,
};

const typeBg = {
    success: 'border-l-4 border-emerald-500',
    error: 'border-l-4 border-red-500',
    warning: 'border-l-4 border-amber-500',
    info: 'border-l-4 border-blue-500',
};

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [toasts, setToasts] = useState<Toast[]>([]);

    const removeToast = useCallback((id: string) => {
        setToasts(p => p.filter(t => t.id !== id));
    }, []);

    const show = useCallback((toast: Omit<Toast, 'id'>) => {
        const id = `toast-${Date.now()}`;
        setToasts(p => [...p, { ...toast, id }]);
        setTimeout(() => removeToast(id), 4000);
    }, [removeToast]);

    const success = useCallback((title: string, message?: string) => show({ type: 'success', title, message }), [show]);
    const error = useCallback((title: string, message?: string) => show({ type: 'error', title, message }), [show]);
    const warning = useCallback((title: string, message?: string) => show({ type: 'warning', title, message }), [show]);
    const info = useCallback((title: string, message?: string) => show({ type: 'info', title, message }), [show]);

    return (
        <ToastContext.Provider value={{ show, success, error, warning, info }}>
            {children}
            {/* Toast container */}
            <div className="fixed top-4 right-4 z-50 flex flex-col gap-2 pointer-events-none">
                {toasts.map(toast => (
                    <div
                        key={toast.id}
                        className={clsx(
                            'bg-white rounded-xl shadow-lg p-4 flex items-start gap-3 min-w-72 max-w-sm pointer-events-auto',
                            'animate-slideIn', typeBg[toast.type]
                        )}
                    >
                        <div className="flex-shrink-0 mt-0.5">{icons[toast.type]}</div>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold text-gray-900">{toast.title}</p>
                            {toast.message && <p className="text-xs text-gray-500 mt-0.5">{toast.message}</p>}
                        </div>
                        <button
                            onClick={() => removeToast(toast.id)}
                            className="flex-shrink-0 p-0.5 hover:bg-gray-100 rounded"
                        >
                            <X className="w-4 h-4 text-gray-400" />
                        </button>
                    </div>
                ))}
            </div>
        </ToastContext.Provider>
    );
};

export const useToast = (): ToastContextType => {
    const ctx = useContext(ToastContext);
    if (!ctx) throw new Error('useToast must be used within ToastProvider');
    return ctx;
};
