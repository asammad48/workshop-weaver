import { Card } from '@/components/ui/Card';
import { FileText } from 'lucide-react';

export default function AuditPage() {
  return (
    <div>
      <h1 style={{ fontSize: '24px', fontWeight: 600, marginBottom: '24px', color: 'var(--c-text)' }}>
        Audit Log
      </h1>
      <Card>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '48px', color: 'var(--c-muted)' }}>
          <FileText size={48} style={{ marginBottom: '16px', opacity: 0.5 }} />
          <p>Audit log coming soon</p>
        </div>
      </Card>
    </div>
  );
}
