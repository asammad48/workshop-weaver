import { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useUIStore, confirm as confirmHelper, ConfirmOptions } from '@/state/uiStore';
import { Button } from './Button';
import styles from './ui.module.css';

// Re-export the confirm helper for convenience
export { confirmHelper as confirm };
export type { ConfirmOptions };

/**
 * Global Confirm Dialog Host - renders confirm dialogs from uiStore
 * Place this once in AppShell
 */
export function ConfirmDialogHost() {
  const confirmState = useUIStore((s) => s.confirm);
  const resolveConfirm = useUIStore((s) => s.resolveConfirm);

  // Close on escape key (resolves as cancel)
  useEffect(() => {
    if (!confirmState) return;

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        resolveConfirm(false);
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [confirmState, resolveConfirm]);

  if (!confirmState) return null;

  const { title, message, confirmText, cancelText, danger } = confirmState;

  return createPortal(
    <div className={styles.modalOverlay} onClick={() => resolveConfirm(false)}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.confirmBody}>
          <h3 className={styles.modalTitle}>{title}</h3>
          <p className={styles.confirmMessage}>{message}</p>
        </div>
        <div className={styles.modalFooter}>
          <Button variant="secondary" onClick={() => resolveConfirm(false)}>
            {cancelText}
          </Button>
          <Button
            variant={danger ? 'danger' : 'primary'}
            onClick={() => resolveConfirm(true)}
          >
            {confirmText}
          </Button>
        </div>
      </div>
    </div>,
    document.body
  );
}
