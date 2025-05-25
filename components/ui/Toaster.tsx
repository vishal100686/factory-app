
import React from 'react';
import { useAppContext } from '../../contexts/AppContext';
import { ToastMessage } from '../../types';

const Toast: React.FC<{ toast: ToastMessage; onDismiss: (id: string) => void }> = ({ toast, onDismiss }) => {
  const baseStyles = "p-4 rounded-md shadow-lg flex items-center justify-between text-white";
  const typeStyles = {
    success: 'bg-green-500',
    error: 'bg-red-500',
    info: 'bg-blue-500',
  };

  return (
    <div className={`${baseStyles} ${typeStyles[toast.type]}`}>
      <span>{toast.message}</span>
      <button onClick={() => onDismiss(toast.id)} className="ml-4 text-xl font-semibold leading-none hover:opacity-75">&times;</button>
    </div>
  );
};

export const Toaster: React.FC = () => {
  const { toasts, removeToast } = useAppContext();

  if (!toasts.length) return null;

  return (
    <div className="fixed bottom-5 right-5 space-y-3 z-[100]">
      {toasts.map((toast) => (
        <Toast key={toast.id} toast={toast} onDismiss={removeToast} />
      ))}
    </div>
  );
};
