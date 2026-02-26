import React from 'react';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'default' | 'outline' | 'secondary' | 'danger' | 'success';
  style?: React.CSSProperties;
}

export const Badge: React.FC<BadgeProps> = ({ children, variant = 'default', style }) => {
  const getColors = () => {
    switch (variant) {
      case 'outline':
        return { border: '1px solid var(--c-border)', color: 'var(--c-text)', backgroundColor: 'transparent' };
      case 'secondary':
        return { backgroundColor: 'var(--c-secondary)', color: 'white' };
      case 'danger':
        return { backgroundColor: 'var(--c-danger)', color: 'white' };
      case 'success':
        return { backgroundColor: 'var(--c-success)', color: 'white' };
      default:
        return { backgroundColor: 'var(--c-primary-soft)', color: 'var(--c-primary)' };
    }
  };

  const colors = getColors();

  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        padding: '2px 8px',
        borderRadius: '999px',
        fontSize: '11px',
        fontWeight: 600,
        textTransform: 'uppercase',
        ...colors,
        ...style,
      }}
    >
      {children}
    </span>
  );
};
