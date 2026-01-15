/**
 * Enhanced Toast Notification System
 * Provides consistent feedback for all user actions
 */

import { useState, useCallback, useEffect } from 'react';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface Toast {
  id: string;
  type: ToastType;
  title: string;
  description?: string;
  duration?: number;
  action?: {
    label: string;
    onClick: () => void;
  };
}

interface ToastState {
  toasts: Toast[];
}

// Global toast state
let toastListeners: ((toasts: Toast[]) => void)[] = [];
let globalToasts: Toast[] = [];

function notifyListeners() {
  toastListeners.forEach((listener) => listener([...globalToasts]));
}

// Toast API
export const toast = {
  success: (title: string, description?: string, duration = 4000) => {
    const id = Math.random().toString(36).substr(2, 9);
    globalToasts.push({ id, type: 'success', title, description, duration });
    notifyListeners();
    setTimeout(() => toast.dismiss(id), duration);
    return id;
  },

  error: (title: string, description?: string, duration = 6000) => {
    const id = Math.random().toString(36).substr(2, 9);
    globalToasts.push({ id, type: 'error', title, description, duration });
    notifyListeners();
    setTimeout(() => toast.dismiss(id), duration);
    return id;
  },

  warning: (title: string, description?: string, duration = 5000) => {
    const id = Math.random().toString(36).substr(2, 9);
    globalToasts.push({ id, type: 'warning', title, description, duration });
    notifyListeners();
    setTimeout(() => toast.dismiss(id), duration);
    return id;
  },

  info: (title: string, description?: string, duration = 4000) => {
    const id = Math.random().toString(36).substr(2, 9);
    globalToasts.push({ id, type: 'info', title, description, duration });
    notifyListeners();
    setTimeout(() => toast.dismiss(id), duration);
    return id;
  },

  promise: async <T>(
    promise: Promise<T>,
    messages: {
      loading: string;
      success: string;
      error: string;
    }
  ): Promise<T> => {
    const loadingId = toast.info(messages.loading, 'Please wait...', 60000);
    try {
      const result = await promise;
      toast.dismiss(loadingId);
      toast.success(messages.success);
      return result;
    } catch (error) {
      toast.dismiss(loadingId);
      toast.error(messages.error, error instanceof Error ? error.message : 'Unknown error');
      throw error;
    }
  },

  dismiss: (id: string) => {
    globalToasts = globalToasts.filter((t) => t.id !== id);
    notifyListeners();
  },

  dismissAll: () => {
    globalToasts = [];
    notifyListeners();
  }
};

// Hook for components to subscribe to toast updates
export function useToast() {
  const [toasts, setToasts] = useState<Toast[]>(globalToasts);

  useEffect(() => {
    toastListeners.push(setToasts);
    return () => {
      toastListeners = toastListeners.filter((l) => l !== setToasts);
    };
  }, []);

  return {
    toasts,
    toast,
    dismiss: toast.dismiss,
    dismissAll: toast.dismissAll
  };
}

// Bilingual toast messages
export const toastMessages = {
  en: {
    saved: 'Changes saved successfully',
    deleted: 'Item deleted successfully',
    created: 'Item created successfully',
    updated: 'Item updated successfully',
    copied: 'Copied to clipboard',
    exported: 'Export completed',
    error: 'An error occurred',
    networkError: 'Network error. Please try again.',
    validationError: 'Please check your input',
    unauthorized: 'You are not authorized to perform this action',
    notFound: 'Item not found',
    comingSoon: 'This feature is coming soon'
  },
  ar: {
    saved: 'تم حفظ التغييرات بنجاح',
    deleted: 'تم حذف العنصر بنجاح',
    created: 'تم إنشاء العنصر بنجاح',
    updated: 'تم تحديث العنصر بنجاح',
    copied: 'تم النسخ إلى الحافظة',
    exported: 'اكتمل التصدير',
    error: 'حدث خطأ',
    networkError: 'خطأ في الشبكة. يرجى المحاولة مرة أخرى.',
    validationError: 'يرجى التحقق من المدخلات',
    unauthorized: 'غير مصرح لك بتنفيذ هذا الإجراء',
    notFound: 'العنصر غير موجود',
    comingSoon: 'هذه الميزة قادمة قريباً'
  }
};

export default toast;
