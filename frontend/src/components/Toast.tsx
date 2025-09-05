import React, { useEffect } from 'react';
import { CheckCircle, XCircle, X } from 'lucide-react';

interface ToastProps {
  message: string;
  type: 'success' | 'error';
  isVisible: boolean;
  onClose: () => void;
}

const Toast: React.FC<ToastProps> = ({ message, type, isVisible, onClose }) => {
  useEffect(() => {
    if (isVisible) {
      const timer = setTimeout(() => {
        onClose();
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [isVisible, onClose]);

  if (!isVisible) return null;

  return (
    <div className="fixed top-4 right-4 z-50 animate-in slide-in-from-top-2 fade-in duration-300">
      <div className={`flex items-center p-4 rounded-lg shadow-lg border ${
        type === 'success'
          ? 'bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-700'
          : 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-700'
      }`}>
        <div className="flex items-center">
          {type === 'success' ? (
            <CheckCircle className="h-5 w-5 text-emerald-600 dark:text-emerald-400 mr-3" />
          ) : (
            <XCircle className="h-5 w-5 text-red-600 dark:text-red-400 mr-3" />
          )}
          <p className={`text-sm font-medium ${
            type === 'success'
              ? 'text-emerald-800 dark:text-emerald-200'
              : 'text-red-800 dark:text-red-200'
          }`}>
            {message}
          </p>
        </div>
        <button
          onClick={onClose}
          className={`ml-4 p-1 rounded-md hover:bg-opacity-20 transition-colors duration-200 ${
            type === 'success'
              ? 'text-emerald-600 dark:text-emerald-400 hover:bg-emerald-600'
              : 'text-red-600 dark:text-red-400 hover:bg-red-600'
          }`}
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
};

export default Toast;