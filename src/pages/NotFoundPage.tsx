import { Link } from 'react-router-dom';
import { Card, CardBody } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { useI18n } from '@/i18n';
import '@/styles/global.css';

export default function NotFoundPage() {
  const { t } = useI18n();

  return (
    <div className="pageCenter">
      <Card style={{ textAlign: 'center', maxWidth: 400 }}>
        <CardBody>
          <h1 style={{ fontSize: 72, margin: '0 0 8px 0', color: 'var(--color-text-muted)' }}>
            404
          </h1>
          <h2 style={{ margin: '0 0 8px 0' }}>{t('notFound.title')}</h2>
          <p className="muted" style={{ marginBottom: 24 }}>
            {t('notFound.message')}
          </p>
          <Link to="/">
            <Button>{t('notFound.backToDashboard')}</Button>
          </Link>
        </CardBody>
      </Card>
    </div>
  );
}
