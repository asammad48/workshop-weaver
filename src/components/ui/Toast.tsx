import { createPortal } from 'react-dom';
import { useUIStore, toast as toastHelper } from '@/state/uiStore';
import styles from './ui.module.css';

// Re-export the toast helper for convenience
export { toastHelper as toast };

/**
 * Global Toast Host - renders toasts from uiStore
 * Place this once in AppShell
 */
export function ToastHost() {
  const toasts = useUIStore((s) => s.toasts);
  const dismissToast = useUIStore((s) => s.dismissToast);

  if (toasts.length === 0) return null;

  return createPortal(
    <div className={styles.toastContainer}>
      {toasts.map((t) => {
        const typeClass = {
          success: styles.toastSuccess,
          error: styles.toastError,
          info: styles.toastInfo,
          warning: styles.toastWarning,
        }[t.type];

        return (
          <div key={t.id} className={`${styles.toast} ${typeClass}`}>
            <div className={styles.toastContent}>{t.message}</div>
            <button
              className={styles.toastDismiss}
              onClick={() => dismissToast(t.id)}
            >
              ×
            </button>
          </div>
        );
      })}
    </div>,
    document.body
  );
}
