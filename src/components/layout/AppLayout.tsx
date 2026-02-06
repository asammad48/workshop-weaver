import { ReactNode } from 'react';
import { Link, useLocation } from 'react-router-dom';

interface AppLayoutProps {
  children: ReactNode;
}

/**
 * Application layout wrapper
 * Includes header with navigation
 */
export function AppLayout({ children }: AppLayoutProps) {
  const location = useLocation();

  const navLinks = [
    { path: '/', label: 'Dashboard' },
    { path: '/theme', label: 'Theme' },
    { path: '/me', label: 'Profile' },
  ];

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
          backgroundColor: 'var(--c-card)',
          borderBottom: '1px solid var(--c-border)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <h1 style={{ fontSize: '18px', margin: 0, color: 'var(--c-text)' }}>
          Workshop Management
        </h1>
        <nav style={{ display: 'flex', gap: '16px' }}>
          {navLinks.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              style={{
                color: location.pathname === link.path 
                  ? 'var(--c-primary)' 
                  : 'var(--c-muted)',
                textDecoration: 'none',
                fontWeight: location.pathname === link.path ? 600 : 400,
                fontSize: '14px',
              }}
            >
              {link.label}
            </Link>
          ))}
        </nav>
      </header>
      <main style={{ flex: 1, padding: '24px', backgroundColor: 'var(--c-bg)' }}>
        {children}
      </main>
    </div>
  );
}
