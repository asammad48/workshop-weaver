import { InputHTMLAttributes, forwardRef } from 'react';
import styles from './ui.module.css';

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, className, id, ...props }, ref) => {
    const inputId = id || props.name;

    const inputClasses = [
      styles.input,
      error && styles.inputError,
      className,
    ]
      .filter(Boolean)
      .join(' ');

    return (
      <div className={styles.inputWrapper}>
        {label && (
          <label htmlFor={inputId} className={styles.inputLabel}>
            {label}
          </label>
        )}
        <input ref={ref} id={inputId} className={inputClasses} {...props} />
        {error && <span className={styles.inputErrorText}>{error}</span>}
      </div>
    );
  }
);

Input.displayName = 'Input';
