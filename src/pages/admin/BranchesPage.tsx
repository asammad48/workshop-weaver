import { Card } from '@/components/ui/Card';
import { Building2 } from 'lucide-react';

export default function BranchesPage() {
  return (
    <div>
      <h1 style={{ fontSize: '24px', fontWeight: 600, marginBottom: '24px', color: 'var(--c-text)' }}>
        Branches
      </h1>
      <Card>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '48px', color: 'var(--c-muted)' }}>
          <Building2 size={48} style={{ marginBottom: '16px', opacity: 0.5 }} />
          <p>Branch management coming soon</p>
        </div>
      </Card>
    </div>
  );
}
