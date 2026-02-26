import { Card } from '@/components/ui/Card';
import { 
  TrendingUp, 
  TrendingDown, 
  Minus, 
  LucideIcon, 
  ClipboardList, 
  Wrench, 
  ClipboardCheck, 
  Banknote, 
  Receipt, 
  Package, 
  FileClock, 
  Truck, 
  ShieldAlert, 
  AlertTriangle, 
  Clock as ClockAlert, 
  ListTodo, 
  Timer, 
  FileText,
  Circle
} from 'lucide-react';

const iconMap: Record<string, LucideIcon> = {
  total_jobcards_open: ClipboardList,
  jobcards_in_shop: Wrench,
  my_jobcards_active: ClipboardCheck,
  revenue_collected: Banknote,
  collections_today: Banknote,
  payments_today: Banknote,
  due_amount_total: Banknote,
  expenses_total: Receipt,
  wages_total: Receipt,
  low_stock_items: Package,
  parts_waiting: Package,
  part_requests_pending: Package,
  pending_po: FileClock,
  pending_transfers: Truck,
  approvals_pending: ShieldAlert,
  approvals_pending_cashier: ShieldAlert,
  roadblockers_open: AlertTriangle,
  my_roadblockers_open: AlertTriangle,
  tasks_overdue: ClockAlert,
  my_tasks_overdue: ClockAlert,
  my_tasks_open: ListTodo,
  avg_days_in_shop: Timer,
  invoices_due_count: FileText,
};

interface KpiCardProps {
  cardKey?: string;
  title: string;
  value: string | number;
  unit?: string;
  trend?: string;
  deltaPercent?: number;
}

export function KpiCard({ cardKey, title, value, unit, trend, deltaPercent }: KpiCardProps) {
  const isPositive = trend === 'up';
  const isNegative = trend === 'down';
  const Icon = (cardKey && iconMap[cardKey]) || Circle;

  return (
    <Card style={{ height: '100%' }}>
      <div style={{ padding: '20px', display: 'flex', alignItems: 'flex-start', gap: '16px' }}>
        <div style={{ 
          padding: '10px', 
          borderRadius: '10px', 
          backgroundColor: 'var(--c-primary-soft)', 
          color: 'var(--c-primary)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <Icon size={20} />
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: '13px', color: 'var(--c-muted)', marginBottom: '4px', fontWeight: 500 }}>
            {title}
          </div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '4px' }}>
            <span style={{ fontSize: '22px', fontWeight: 700, color: 'var(--c-text)' }}>{value}</span>
            {unit && <span style={{ fontSize: '13px', color: 'var(--c-muted)' }}>{unit}</span>}
          </div>
          {(deltaPercent !== undefined || trend) && (
            <div style={{
              marginTop: '8px',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              fontSize: '12px',
              color: isPositive ? 'var(--c-success)' : isNegative ? 'var(--c-danger)' : 'var(--c-muted)'
            }}>
              {isPositive && <TrendingUp size={14} />}
              {isNegative && <TrendingDown size={14} />}
              {!isPositive && !isNegative && <Minus size={14} />}
              <span>
                {deltaPercent !== undefined ? `${deltaPercent > 0 ? '+' : ''}${deltaPercent}%` : ''}
              </span>
            </div>
          )}
        </div>
      </div>
    </Card>
  );
}
