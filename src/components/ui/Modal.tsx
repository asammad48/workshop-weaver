import { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useUIStore } from '@/state/uiStore';
import styles from './ui.module.css';

/**
 * Global Modal Host - renders modals from uiStore
 * Place this once in AppShell
 */
export function ModalHost() {
  const modal = useUIStore((s) => s.modal);
  const closeModal = useUIStore((s) => s.closeModal);

  // Close on escape key
  useEffect(() => {
    if (!modal) return;

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        closeModal();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [modal, closeModal]);

  if (!modal) return null;

  return createPortal(
    <div className={styles.modalOverlay} onClick={closeModal}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.modalHeader}>
          <h3 className={styles.modalTitle}>{modal.title}</h3>
          <button className={styles.modalClose} onClick={closeModal}>
            ×
          </button>
        </div>
        <div className={styles.modalBody}>{modal.content}</div>
      </div>
    </div>,
    document.body
  );
}

/**
 * Modal wrapper component for custom modal content
 */
interface ModalContentProps {
  footer?: React.ReactNode;
  children: React.ReactNode;
}

export function ModalContent({ footer, children }: ModalContentProps) {
  return (
    <>
      <div>{children}</div>
      {footer && <div className={styles.modalFooter}>{footer}</div>}
    </>
  );
}
