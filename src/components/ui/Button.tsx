import { ButtonHTMLAttributes, forwardRef } from 'react';
import styles from './ui.module.css';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  block?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = 'primary', size = 'md', block, className, children, ...props }, ref) => {
    const classes = [
      styles.btn,
      variant === 'primary' && styles.btnPrimary,
      variant === 'secondary' && styles.btnSecondary,
      variant === 'danger' && styles.btnDanger,
      variant === 'ghost' && styles.btnGhost,
      size === 'sm' && styles.btnSm,
      size === 'lg' && styles.btnLg,
      block && styles.btnBlock,
      className,
    ]
      .filter(Boolean)
      .join(' ');

    return (
      <button ref={ref} className={classes} {...props}>
        {children}
      </button>
    );
  }
);

Button.displayName = 'Button';
