import { useEffect } from 'react';
import { AppRoutes } from './routes';
import { ModalHost } from '@/components/ui/Modal';
import { ConfirmDialogHost } from '@/components/ui/ConfirmDialog';
import { ToastHost } from '@/components/ui/Toast';
import { useThemeStore } from '@/state/themeStore';

/**
 * Main application shell
 * Contains routing and global hosts for modals, confirms, and toasts
 */
export function AppShell() {
  useEffect(() => {
    // Load theme from localStorage on startup
    useThemeStore.getState().loadTheme();
  }, []);

  return (
    <>
      <AppRoutes />
      <ModalHost />
      <ConfirmDialogHost />
      <ToastHost />
    </>
  );
}
