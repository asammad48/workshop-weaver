import { Card } from '@/components/ui/Card';
import { Car } from 'lucide-react';

export default function VehiclesPage() {
  return (
    <div>
      <h1 style={{ fontSize: '24px', fontWeight: 600, marginBottom: '24px', color: 'var(--c-text)' }}>
        Vehicles
      </h1>
      <Card>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '48px', color: 'var(--c-muted)' }}>
          <Car size={48} style={{ marginBottom: '16px', opacity: 0.5 }} />
          <p>Vehicle management coming soon</p>
        </div>
      </Card>
    </div>
  );
}
