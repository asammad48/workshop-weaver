import { Link } from 'react-router-dom';
import { Card, CardBody } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import '@/styles/global.css';

export default function NotFoundPage() {
  return (
    <div className="pageCenter">
      <Card style={{ textAlign: 'center', maxWidth: 400 }}>
        <CardBody>
          <h1 style={{ fontSize: 72, margin: '0 0 8px 0', color: 'var(--color-text-muted)' }}>
            404
          </h1>
          <h2 style={{ margin: '0 0 8px 0' }}>Page Not Found</h2>
          <p className="muted" style={{ marginBottom: 24 }}>
            The page you're looking for doesn't exist or has been moved.
          </p>
          <Link to="/">
            <Button>Go to Dashboard</Button>
          </Link>
        </CardBody>
      </Card>
    </div>
  );
}
