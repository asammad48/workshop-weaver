import { useAuth } from '@/hooks/useAuth';
import { Card, CardHeader, CardBody } from '@/components/ui/Card';
import '@/styles/global.css';

/**
 * User profile page placeholder
 */
export default function MePage() {
  const { user } = useAuth();

  return (
    <div className="page">
      <Card style={{ maxWidth: 600 }}>
        <CardHeader>
          <h2 style={{ margin: 0 }}>My Profile</h2>
        </CardHeader>
        <CardBody>
          <div className="stack">
            <div>
              <p className="muted" style={{ margin: 0, fontSize: 12 }}>Email</p>
              <p style={{ margin: 0 }}>{user?.email || 'N/A'}</p>
            </div>
            <div>
              <p className="muted" style={{ margin: 0, fontSize: 12 }}>Name</p>
              <p style={{ margin: 0 }}>{user?.name || 'N/A'}</p>
            </div>
            <div>
              <p className="muted" style={{ margin: 0, fontSize: 12 }}>Role</p>
              <p style={{ margin: 0 }}>{user?.role || 'N/A'}</p>
            </div>
          </div>
        </CardBody>
      </Card>
    </div>
  );
}
