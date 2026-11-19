import React from 'react';
import { CheckCircle2, Info, X } from 'lucide-react';

export interface ToastItem {
  id: string;
  message: string;
  variant?: 'success' | 'info';
  actionLabel?: string;
  onAction?: () => void;
}

interface ToastContainerProps {
  toasts: ToastItem[];
  onDismiss: (id: string) => void;
}

export const ToastContainer: React.FC<ToastContainerProps> = ({
  toasts,
  onDismiss,
}) => {
  if (toasts.length === 0) return null;

  return (
    <div
      aria-live="polite"
      aria-atomic="true"
      className="fixed bottom-5 left-1/2 -translate-x-1/2 sm:left-auto sm:translate-x-0 sm:bottom-6 sm:left-6 z-50 flex flex-col gap-2 w-[calc(100%-2rem)] max-w-sm pointer-events-none"
    >
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className="pointer-events-auto animate-toast-in flex items-center justify-between gap-3 px-4 py-3 rounded-xl bg-[#1E1B4B] dark:bg-slate-800 text-white border border-indigo-900/60 dark:border-slate-700 shadow-lg"
        >
          <div className="flex items-center gap-2.5 min-w-0">
            {toast.variant === 'info' ? (
              <Info className="w-4 h-4 text-blue-300 shrink-0" />
            ) : (
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            )}
            <span className="text-xs font-medium leading-snug truncate">
              {toast.message}
            </span>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {toast.actionLabel && toast.onAction && (
              <button
                type="button"
                onClick={() => {
                  toast.onAction?.();
                  onDismiss(toast.id);
                }}
                className="text-xs font-semibold text-blue-300 hover:text-white underline cursor-pointer whitespace-nowrap"
              >
                {toast.actionLabel}
              </button>
            )}
            <button
              type="button"
              onClick={() => onDismiss(toast.id)}
              className="p-0.5 rounded text-slate-300 hover:text-white cursor-pointer"
              aria-label="Dismiss notification"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};
