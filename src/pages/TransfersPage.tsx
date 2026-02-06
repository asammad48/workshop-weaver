import { Card } from '@/components/ui/Card';
import { ArrowLeftRight } from 'lucide-react';

export default function TransfersPage() {
  return (
    <div>
      <h1 style={{ fontSize: '24px', fontWeight: 600, marginBottom: '24px', color: 'var(--c-text)' }}>
        Transfers
      </h1>
      <Card>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '48px', color: 'var(--c-muted)' }}>
          <ArrowLeftRight size={48} style={{ marginBottom: '16px', opacity: 0.5 }} />
          <p>Inventory transfers management coming soon</p>
        </div>
      </Card>
    </div>
  );
}
