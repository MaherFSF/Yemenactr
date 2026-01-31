/**
 * Toast Provider Component
 * Renders toast notifications with animations
 */

import { useToast, Toast } from '@/hooks/useToast';
import { motion, AnimatePresence } from 'framer-motion';
import { X, CheckCircle, AlertCircle, AlertTriangle, Info } from 'lucide-react';
import { cn } from '@/lib/utils';

const icons = {
  success: CheckCircle,
  error: AlertCircle,
  warning: AlertTriangle,
  info: Info
};

const colors = {
  success: 'bg-green-50 border-green-200 text-green-800 dark:bg-green-900/20 dark:border-green-800 dark:text-green-200',
  error: 'bg-red-50 border-red-200 text-red-800 dark:bg-red-900/20 dark:border-red-800 dark:text-red-200',
  warning: 'bg-yellow-50 border-yellow-200 text-yellow-800 dark:bg-yellow-900/20 dark:border-yellow-800 dark:text-yellow-200',
  info: 'bg-blue-50 border-blue-200 text-[#2C3424] dark:bg-blue-900/20 dark:border-blue-800 dark:text-blue-200'
};

const iconColors = {
  success: 'text-green-500',
  error: 'text-red-500',
  warning: 'text-yellow-500',
  info: 'text-blue-500'
};

function ToastItem({ toast, onDismiss }: { toast: Toast; onDismiss: () => void }) {
  const Icon = icons[toast.type];

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 50, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
      className={cn(
        'flex items-start gap-3 p-4 rounded-lg border shadow-lg max-w-sm w-full',
        colors[toast.type]
      )}
    >
      <Icon className={cn('h-5 w-5 flex-shrink-0 mt-0.5', iconColors[toast.type])} />
      <div className="flex-1 min-w-0">
        <p className="font-medium text-sm">{toast.title}</p>
        {toast.description && (
          <p className="text-sm opacity-80 mt-1">{toast.description}</p>
        )}
        {toast.action && (
          <button
            onClick={toast.action.onClick}
            className="text-sm font-medium underline mt-2 hover:no-underline"
          >
            {toast.action.label}
          </button>
        )}
      </div>
      <button
        onClick={onDismiss}
        className="flex-shrink-0 p-1 rounded hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
      >
        <X className="h-4 w-4" />
      </button>
    </motion.div>
  );
}

export function ToastProvider() {
  const { toasts, dismiss } = useToast();

  return (
    <div className="fixed bottom-4 right-4 z-[100] flex flex-col gap-2 pointer-events-none">
      <AnimatePresence mode="popLayout">
        {toasts.map((toast) => (
          <div key={toast.id} className="pointer-events-auto">
            <ToastItem toast={toast} onDismiss={() => dismiss(toast.id)} />
          </div>
        ))}
      </AnimatePresence>
    </div>
  );
}

export default ToastProvider;
