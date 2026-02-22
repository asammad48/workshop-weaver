import { Card } from '@/components/ui/Card';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface KpiCardProps {
  title: string;
  value: string | number;
  unit?: string;
  trend?: string;
  deltaPercent?: number;
}

export function KpiCard({ title, value, unit, trend, deltaPercent }: KpiCardProps) {
  const isPositive = trend === 'up';
  const isNegative = trend === 'down';

  return (
    <Card style={{ padding: '20px', height: '100%' }}>
      <div style={{ fontSize: '14px', color: 'var(--c-muted)', marginBottom: '8px', fontWeight: 500 }}>
        {title}
      </div>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: '4px' }}>
        <span style={{ fontSize: '24px', fontWeight: 700, color: 'var(--c-text)' }}>{value}</span>
        {unit && <span style={{ fontSize: '14px', color: 'var(--c-muted)' }}>{unit}</span>}
      </div>
      {(deltaPercent !== undefined || trend) && (
        <div style={{
          marginTop: '12px',
          display: 'flex',
          alignItems: 'center',
          gap: '4px',
          fontSize: '13px',
          color: isPositive ? 'var(--c-success)' : isNegative ? 'var(--c-danger)' : 'var(--c-muted)'
        }}>
          {isPositive && <TrendingUp size={16} />}
          {isNegative && <TrendingDown size={16} />}
          {!isPositive && !isNegative && <Minus size={16} />}
          <span>
            {deltaPercent !== undefined ? `${deltaPercent > 0 ? '+' : ''}${deltaPercent}%` : ''}
          </span>
        </div>
      )}
    </Card>
  );
}
