import { ReactNode, useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { ChevronLeft, ChevronRight, LogOut } from 'lucide-react';
import { getNav } from '@/app/nav';
import { useAuthStore } from '@/state/authStore';
import { confirm } from '@/components/ui/ConfirmDialog';
import { toast } from '@/components/ui/Toast';

interface AppLayoutProps {
  children: ReactNode;
}

const SIDEBAR_KEY = 'ui.sidebarCollapsed';

/**
 * Application layout with collapsible sidebar navigation
 */
export function AppLayout({ children }: AppLayoutProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();
  const [collapsed, setCollapsed] = useState(() => {
    return localStorage.getItem(SIDEBAR_KEY) === 'true';
  });

  const navGroups = getNav(user?.role);

  // Persist collapsed state
  useEffect(() => {
    localStorage.setItem(SIDEBAR_KEY, String(collapsed));
  }, [collapsed]);

  const handleLogout = async () => {
    const confirmed = await confirm({
      title: 'Logout',
      message: 'Are you sure you want to logout?',
      confirmText: 'Logout',
      danger: true,
    });

    if (confirmed) {
      logout();
      toast.info('Logged out successfully');
      navigate('/login');
    }
  };

  const isActive = (path: string) => {
    if (path === '/') return location.pathname === '/';
    return location.pathname.startsWith(path);
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', width: '100%' }}>
      {/* Sidebar */}
      <aside
        style={{
          width: collapsed ? '64px' : '240px',
          backgroundColor: 'var(--c-card)',
          borderRight: '1px solid var(--c-border)',
          display: 'flex',
          flexDirection: 'column',
          transition: 'width 0.2s ease',
          overflow: 'hidden',
        }}
      >
        {/* Logo/Header */}
        <div
          style={{
            padding: '16px',
            borderBottom: '1px solid var(--c-border)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: collapsed ? 'center' : 'space-between',
            minHeight: '56px',
          }}
        >
          {!collapsed && (
            <span
              style={{
                fontWeight: 600,
                fontSize: '14px',
                color: 'var(--c-text)',
                whiteSpace: 'nowrap',
              }}
            >
              Workshop
            </span>
          )}
          <button
            onClick={() => setCollapsed(!collapsed)}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              padding: '4px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--c-muted)',
              borderRadius: '4px',
            }}
            title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {collapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
          </button>
        </div>

        {/* Navigation */}
        <nav style={{ flex: 1, overflow: 'auto', padding: '8px' }}>
          {navGroups.map((group) => (
            <div key={group.label} style={{ marginBottom: '16px' }}>
              {!collapsed && (
                <div
                  style={{
                    fontSize: '11px',
                    fontWeight: 600,
                    color: 'var(--c-muted)',
                    textTransform: 'uppercase',
                    padding: '8px 12px 4px',
                    letterSpacing: '0.5px',
                  }}
                >
                  {group.label}
                </div>
              )}
              {group.items.map((item) => {
                const Icon = item.icon;
                const active = isActive(item.path);
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    title={collapsed ? item.label : undefined}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '10px',
                      padding: collapsed ? '10px' : '10px 12px',
                      borderRadius: '6px',
                      textDecoration: 'none',
                      color: active ? 'var(--c-primary)' : 'var(--c-text)',
                      backgroundColor: active ? 'var(--c-primary-soft)' : 'transparent',
                      fontWeight: active ? 500 : 400,
                      fontSize: '13px',
                      marginBottom: '2px',
                      justifyContent: collapsed ? 'center' : 'flex-start',
                      transition: 'background-color 0.15s ease',
                    }}
                  >
                    <Icon size={18} style={{ flexShrink: 0 }} />
                    {!collapsed && (
                      <span style={{ whiteSpace: 'nowrap' }}>
                        {item.label}
                        {item.readOnly && (
                          <span
                            style={{
                              fontSize: '10px',
                              color: 'var(--c-muted)',
                              marginLeft: '4px',
                            }}
                          >
                            (view)
                          </span>
                        )}
                      </span>
                    )}
                  </Link>
                );
              })}
            </div>
          ))}
        </nav>

        {/* User section */}
        <div
          style={{
            padding: '12px 8px',
            borderTop: '1px solid var(--c-border)',
          }}
        >
          {!collapsed && user && (
            <div
              style={{
                padding: '8px 12px',
                marginBottom: '8px',
                fontSize: '12px',
                color: 'var(--c-muted)',
              }}
            >
              <div style={{ color: 'var(--c-text)', fontWeight: 500 }}>
                {user.email}
              </div>
              <div style={{ fontSize: '11px', textTransform: 'uppercase' }}>
                {user.role || 'User'}
              </div>
            </div>
          )}
          <button
            onClick={handleLogout}
            title={collapsed ? 'Logout' : undefined}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              width: '100%',
              padding: collapsed ? '10px' : '10px 12px',
              borderRadius: '6px',
              border: 'none',
              backgroundColor: 'transparent',
              color: 'var(--c-danger, #dc2626)',
              cursor: 'pointer',
              fontSize: '13px',
              justifyContent: collapsed ? 'center' : 'flex-start',
            }}
          >
            <LogOut size={18} />
            {!collapsed && <span>Logout</span>}
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main
        style={{
          flex: 1,
          backgroundColor: 'var(--c-bg)',
          overflow: 'auto',
        }}
      >
        <div style={{ padding: '24px' }}>{children}</div>
      </main>
    </div>
  );
}
