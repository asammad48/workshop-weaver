import { useNavigate } from 'react-router-dom';
import { Card, CardHeader, CardBody } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { toast } from '@/components/ui/Toast';
import { confirm } from '@/components/ui/ConfirmDialog';
import { useAuth } from '@/hooks/useAuth';
import { AppLayout } from '@/components/layout/AppLayout';
import '@/styles/global.css';

export default function DashboardPage() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const handleLogout = async () => {
    const confirmed = await confirm({
      title: 'Logout',
      message: 'Are you sure you want to logout?',
      confirmText: 'Logout',
      cancelText: 'Cancel',
    });

    if (confirmed) {
      logout();
      toast.info('You have been logged out');
      navigate('/login');
    }
  };

  const handleToastTest = () => {
    toast.success('Success toast!');
    setTimeout(() => toast.error('Error toast!'), 500);
    setTimeout(() => toast.info('Info toast!'), 1000);
    setTimeout(() => toast.warning('Warning toast!'), 1500);
  };

  return (
    <AppLayout>
      <div className="stack">
        <Card>
          <CardHeader>
            <h2 style={{ margin: 0 }}>Dashboard</h2>
          </CardHeader>
          <CardBody>
            <div className="stack">
              <p>
                Welcome, <strong>{user?.email || 'User'}</strong>!
              </p>
              <p className="muted">
                This is your Workshop Management dashboard. Start building your
                features in the <code>src/features/</code> directory.
              </p>
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardHeader>
            <h3 style={{ margin: 0 }}>Test UI Components</h3>
          </CardHeader>
          <CardBody>
            <div className="row">
              <Button onClick={handleToastTest}>Test Toasts</Button>
              <Button variant="danger" onClick={handleLogout}>
                Logout
              </Button>
            </div>
          </CardBody>
        </Card>
      </div>
    </AppLayout>
  );
}
