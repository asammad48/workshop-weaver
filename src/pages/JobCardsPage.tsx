import { Card } from '@/components/ui/Card';
import { Wrench } from 'lucide-react';

export default function JobCardsPage() {
  return (
    <div>
      <h1 style={{ fontSize: '24px', fontWeight: 600, marginBottom: '24px', color: 'var(--c-text)' }}>
        Job Cards
      </h1>
      <Card>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '48px', color: 'var(--c-muted)' }}>
          <Wrench size={48} style={{ marginBottom: '16px', opacity: 0.5 }} />
          <p>Job Cards management coming soon</p>
        </div>
      </Card>
    </div>
  );
}
