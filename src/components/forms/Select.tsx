import React from 'react';

interface SelectOption {
  value: string | number;
  label: string;
}

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  options: SelectOption[];
  errorText?: string;
  placeholder?: string;
}

export function Select({ 
  label, 
  options, 
  errorText, 
  placeholder, 
  style, 
  ...props 
}: SelectProps) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', width: '100%' }}>
      {label && (
        <label style={{ fontSize: '14px', fontWeight: 500, color: 'var(--c-text)' }}>
          {label}
        </label>
      )}
      <select
        style={{
          width: '100%',
          padding: '8px 12px',
          borderRadius: '6px',
          border: errorText ? '1px solid var(--c-danger)' : '1px solid var(--c-border)',
          background: 'var(--c-bg)',
          color: 'var(--c-text)',
          fontSize: '14px',
          outline: 'none',
          ...style
        }}
        {...props}
      >
        {placeholder && <option value="">{placeholder}</option>}
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      {errorText && (
        <span style={{ fontSize: '12px', color: 'var(--c-danger)' }}>
          {errorText}
        </span>
      )}
    </div>
  );
}
