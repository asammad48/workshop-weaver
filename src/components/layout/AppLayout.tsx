import { ReactNode, useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { ChevronLeft, ChevronRight, LogOut, User as UserIcon } from 'lucide-react';
import { getNav } from '@/app/nav';
import { useAuthStore } from '@/state/authStore';
import { confirm } from '@/components/ui/ConfirmDialog';
import { toast } from '@/components/ui/Toast';
import { Button } from '@/components/ui/Button';

interface AppLayoutProps {
  children: ReactNode;
}

const SIDEBAR_KEY = 'ui.sidebarCollapsed';

/**
 * Application layout with collapsible sidebar navigation and topbar
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
    <div style={{ display: 'flex', minHeight: '100vh', width: '100%', backgroundColor: 'var(--c-bg)' }}>
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
          zIndex: 50,
        }}
      >
        {/* Sidebar Toggle / Header */}
        <div
          style={{
            padding: '16px',
            borderBottom: '1px solid var(--c-border)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: collapsed ? 'center' : 'flex-end',
            minHeight: '64px',
          }}
        >
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
                      </span>
                    )}
                  </Link>
                );
              })}
            </div>
          ))}
        </nav>
      </aside>

      {/* Main Container */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        {/* Topbar */}
        <header
          style={{
            height: '64px',
            backgroundColor: 'var(--c-card)',
            borderBottom: '1px solid var(--c-border)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '0 24px',
            zIndex: 40,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <span style={{ fontWeight: 700, fontSize: '18px', color: 'var(--c-text)' }}>Workshop Management</span>
            {user?.branchId && (
              <span
                style={{
                  backgroundColor: 'var(--c-primary-soft)',
                  color: 'var(--c-primary)',
                  fontSize: '11px',
                  fontWeight: 600,
                  padding: '2px 8px',
                  borderRadius: '999px',
                  textTransform: 'uppercase',
                }}
              >
                Branch: {user.branchId}
              </span>
            )}
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--c-muted)', fontSize: '13px' }}>
              <UserIcon size={16} />
              <span>{user?.email}</span>
            </div>
            <Button variant="ghost" size="sm" onClick={handleLogout} style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--c-danger)' }}>
              <LogOut size={16} />
              <span>Logout</span>
            </Button>
          </div>
        </header>

        {/* Page Content */}
        <main style={{ flex: 1, overflow: 'auto' }}>
          <div style={{ padding: '24px', maxWidth: '1400px', margin: '0 auto' }}>
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
