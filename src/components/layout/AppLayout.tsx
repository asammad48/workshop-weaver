import { ReactNode } from 'react';

interface AppLayoutProps {
  children: ReactNode;
}

/**
 * Application layout wrapper
 * Extend with sidebar, header, etc. as needed
 */
export function AppLayout({ children }: AppLayoutProps) {
  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <header
        style={{
          padding: '12px 24px',
          backgroundColor: 'var(--color-surface)',
          borderBottom: '1px solid var(--color-border)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <h1 style={{ fontSize: '18px', margin: 0 }}>Workshop Management</h1>
      </header>
      <main style={{ flex: 1, padding: '24px' }}>{children}</main>
    </div>
  );
}
