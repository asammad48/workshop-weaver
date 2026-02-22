import { ReactNode } from 'react';
import { Card } from '@/components/ui/Card';
import { Loader2 } from 'lucide-react';

interface Column<T> {
  header: string;
  render: (item: T) => ReactNode;
  style?: React.CSSProperties;
}

interface AlertTableProps<T> {
  title: string;
  columns: Column<T>[];
  data: T[];
  loading?: boolean;
  emptyMessage?: string;
  onRowClick?: (item: T) => void;
}

export function AlertTable<T>({
  title,
  columns,
  data,
  loading,
  emptyMessage = 'No data available',
  onRowClick
}: AlertTableProps<T>) {
  return (
    <Card style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <div style={{ padding: '16px', borderBottom: '1px solid var(--c-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h3 style={{ fontSize: '16px', fontWeight: 600, color: 'var(--c-text)' }}>{title}</h3>
      </div>
      <div style={{ flex: 1, overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--c-border)', textAlign: 'left' }}>
              {columns.map((col, i) => (
                <th key={i} style={{ padding: '12px 16px', color: 'var(--c-muted)', fontSize: '13px', fontWeight: 500, ...col.style }}>
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={columns.length} style={{ padding: '48px', textAlign: 'center' }}>
                  <Loader2 size={24} className="animate-spin" style={{ margin: '0 auto', color: 'var(--c-primary)' }} />
                </td>
              </tr>
            ) : data.length === 0 ? (
              <tr>
                <td colSpan={columns.length} style={{ padding: '48px', textAlign: 'center', color: 'var(--c-muted)', fontSize: '14px' }}>
                  {emptyMessage}
                </td>
              </tr>
            ) : (
              data.map((item, i) => (
                <tr
                  key={i}
                  style={{
                    borderBottom: '1px solid var(--c-border)',
                    cursor: onRowClick ? 'pointer' : 'default'
                  }}
                  onClick={() => onRowClick?.(item)}
                >
                  {columns.map((col, j) => (
                    <td key={j} style={{ padding: '12px 16px', fontSize: '14px', color: 'var(--c-text)', ...col.style }}>
                      {col.render(item)}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </Card>
  );
}
