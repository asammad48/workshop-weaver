import { Card } from '@/components/ui/Card';
import { ShoppingCart } from 'lucide-react';

export default function PurchaseOrdersPage() {
  return (
    <div>
      <h1 style={{ fontSize: '24px', fontWeight: 600, marginBottom: '24px', color: 'var(--c-text)' }}>
        Purchase Orders
      </h1>
      <Card>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '48px', color: 'var(--c-muted)' }}>
          <ShoppingCart size={48} style={{ marginBottom: '16px', opacity: 0.5 }} />
          <p>Purchase Orders management coming soon</p>
        </div>
      </Card>
    </div>
  );
}
