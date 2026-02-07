import { ReactNode } from 'react';

interface TableProps {
  children: ReactNode;
  className?: string;
}

/**
 * Basic table component placeholder
 * Extend as needed for your use case
 */
export function Table({ children, className }: TableProps) {
  return (
    <table
      className={className}
      style={{
        width: '100%',
        borderCollapse: 'collapse',
      }}
    >
      {children}
    </table>
  );
}

export function Thead({ children }: { children: ReactNode }) {
  return (
    <thead
      style={{
        backgroundColor: 'var(--color-bg)',
        borderBottom: '2px solid var(--color-border)',
      }}
    >
      {children}
    </thead>
  );
}

export function Tbody({ children }: { children: ReactNode }) {
  return <tbody>{children}</tbody>;
}

export function Tr({ children }: { children: ReactNode }) {
  return (
    <tr style={{ borderBottom: '1px solid var(--color-border)' }}>{children}</tr>
  );
}

export function Th({ children }: { children: ReactNode }) {
  return (
    <th
      style={{
        padding: '12px 16px',
        textAlign: 'left',
        fontWeight: 600,
        color: 'var(--color-text)',
      }}
    >
      {children}
    </th>
  );
}

export function Td({ children }: { children: ReactNode }) {
  return (
    <td
      style={{
        padding: '12px 16px',
        color: 'var(--color-text)',
      }}
    >
      {children}
    </td>
  );
}
