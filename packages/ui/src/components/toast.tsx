import React, { useEffect, useState } from 'react';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface ToastProps {
  id: string;
  type: ToastType;
  title: string;
  message?: string;
  duration?: number;
  onDismiss: (id: string) => void;
}

const typeConfig: Record<ToastType, { icon: string; bg: string; border: string; text: string }> = {
  success: { icon: 'M5 13l4 4L19 7', bg: 'bg-green-50', border: 'border-green-200', text: 'text-green-800' },
  error: { icon: 'M6 18L18 6M6 6l12 12', bg: 'bg-red-50', border: 'border-red-200', text: 'text-red-800' },
  warning: { icon: 'M12 9v2m0 4h.01M12 2L2 22h20L12 2z', bg: 'bg-yellow-50', border: 'border-yellow-200', text: 'text-yellow-800' },
  info: { icon: 'M13 16h-1v-4h-1m1-4h.01M12 2a10 10 0 100 20 10 10 0 000-20z', bg: 'bg-blue-50', border: 'border-blue-200', text: 'text-blue-800' },
};

export const Toast: React.FC<ToastProps> = ({ id, type, title, message, duration = 5000, onDismiss }) => {
  const [visible, setVisible] = useState(true);
  const config = typeConfig[type];

  useEffect(() => {
    if (duration > 0) {
      const timer = setTimeout(() => {
        setVisible(false);
        setTimeout(() => onDismiss(id), 300);
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [duration, id, onDismiss]);

  return (
    <div
      className={`
        flex items-start gap-3 p-4 rounded-lg border shadow-lg transition-all duration-300
        ${config.bg} ${config.border}
        ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-2'}
      `}
      role="alert"
    >
      <svg className={`w-5 h-5 ${config.text} flex-shrink-0 mt-0.5`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
        <path strokeLinecap="round" strokeLinejoin="round" d={config.icon} />
      </svg>
      <div className="flex-1 min-w-0">
        <p className={`text-sm font-medium ${config.text}`}>{title}</p>
        {message && <p className={`mt-1 text-sm ${config.text} opacity-80`}>{message}</p>}
      </div>
      <button
        type="button"
        onClick={() => onDismiss(id)}
        className={`flex-shrink-0 ${config.text} hover:opacity-70`}
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>
  );
};

export interface ToastContainerProps {
  toasts: ToastProps[];
  onDismiss: (id: string) => void;
  position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left';
}

const positionClasses = {
  'top-right': 'top-4 right-4',
  'top-left': 'top-4 left-4',
  'bottom-right': 'bottom-4 right-4',
  'bottom-left': 'bottom-4 left-4',
};

export const ToastContainer: React.FC<ToastContainerProps> = ({
  toasts,
  onDismiss,
  position = 'top-right',
}) => {
  return (
    <div className={`fixed z-[100] flex flex-col gap-2 w-80 ${positionClasses[position]}`}>
      {toasts.map((toast) => (
        <Toast key={toast.id} {...toast} onDismiss={onDismiss} />
      ))}
    </div>
  );
};
