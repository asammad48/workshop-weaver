import { AppRoutes } from './routes';
import { ModalHost } from '@/components/ui/Modal';
import { ConfirmDialogHost } from '@/components/ui/ConfirmDialog';
import { ToastHost } from '@/components/ui/Toast';

/**
 * Main application shell
 * Contains routing and global hosts for modals, confirms, and toasts
 */
export function AppShell() {
  return (
    <>
      <AppRoutes />
      <ModalHost />
      <ConfirmDialogHost />
      <ToastHost />
    </>
  );
}
