import { create } from 'zustand';
import { ReactNode } from 'react';

// Modal types
export interface ModalState {
  title: string;
  content: ReactNode;
}

// Confirm types
export interface ConfirmOptions {
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  danger?: boolean;
}

interface ConfirmState extends ConfirmOptions {
  _resolver: ((value: boolean) => void) | null;
}

// Toast types
export type ToastType = 'success' | 'error' | 'info' | 'warning';

export interface ToastItem {
  id: string;
  type: ToastType;
  message: string;
}

// Store interface
interface UIState {
  // Modal
  modal: ModalState | null;
  openModal: (title: string, content: ReactNode) => void;
  closeModal: () => void;

  // Confirm
  confirm: ConfirmState | null;
  openConfirm: (options: ConfirmOptions) => Promise<boolean>;
  resolveConfirm: (result: boolean) => void;

  // Toasts
  toasts: ToastItem[];
  pushToast: (type: ToastType, message: string) => void;
  dismissToast: (id: string) => void;
}

let toastIdCounter = 0;

export const useUIStore = create<UIState>((set, get) => ({
  // Modal state
  modal: null,
  openModal: (title, content) => set({ modal: { title, content } }),
  closeModal: () => set({ modal: null }),

  // Confirm state
  confirm: null,
  openConfirm: (options) => {
    return new Promise<boolean>((resolve) => {
      set({
        confirm: {
          ...options,
          confirmText: options.confirmText ?? 'Confirm',
          cancelText: options.cancelText ?? 'Cancel',
          _resolver: resolve,
        },
      });
    });
  },
  resolveConfirm: (result) => {
    const { confirm } = get();
    if (confirm?._resolver) {
      confirm._resolver(result);
    }
    set({ confirm: null });
  },

  // Toast state
  toasts: [],
  pushToast: (type, message) => {
    const id = `toast-${++toastIdCounter}`;
    set((state) => ({
      toasts: [...state.toasts, { id, type, message }],
    }));

    // Auto-remove after 3.5s
    setTimeout(() => {
      get().dismissToast(id);
    }, 3500);
  },
  dismissToast: (id) => {
    set((state) => ({
      toasts: state.toasts.filter((t) => t.id !== id),
    }));
  },
}));

// Convenience helpers
export const confirm = (options: ConfirmOptions) => useUIStore.getState().openConfirm(options);

export const toast = {
  success: (message: string) => useUIStore.getState().pushToast('success', message),
  error: (message: string) => useUIStore.getState().pushToast('error', message),
  info: (message: string) => useUIStore.getState().pushToast('info', message),
  warning: (message: string) => useUIStore.getState().pushToast('warning', message),
};

export const openModal = (title: string, content: ReactNode) => 
  useUIStore.getState().openModal(title, content);

export const closeModal = () => useUIStore.getState().closeModal();
