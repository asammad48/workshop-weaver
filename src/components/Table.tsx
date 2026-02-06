import { ReactNode } from 'react';

interface TableProps<T> {
  columns: {
    header: string;
    accessor: keyof T | ((item: T) => ReactNode);
  }[];
  data: T[];
  isLoading?: boolean;
  emptyMessage?: string;
  className?: string;
}

/**
 * Enhanced table component with columns configuration
 */
export function Table<T>({ columns, data, isLoading, emptyMessage = 'No data found', className }: TableProps<T>) {
  if (isLoading) {
    return (
      <div style={{ padding: '48px', textAlign: 'center', color: 'var(--c-muted)' }}>
        Loading...
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div style={{ padding: '48px', textAlign: 'center', color: 'var(--c-muted)' }}>
        {emptyMessage}
      </div>
    );
  }

  return (
    <div style={{ overflowX: 'auto', width: '100%' }}>
      <table
        className={className}
        style={{
          width: '100%',
          borderCollapse: 'collapse',
        }}
      >
        <thead
          style={{
            backgroundColor: 'var(--c-primary-soft)',
            borderBottom: '1px solid var(--c-border)',
          }}
        >
          <tr>
            {columns.map((col, idx) => (
              <th
                key={idx}
                style={{
                  padding: '12px 16px',
                  textAlign: 'left',
                  fontWeight: 600,
                  fontSize: '13px',
                  color: 'var(--c-text)',
                  whiteSpace: 'nowrap',
                }}
              >
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((item, rowIdx) => (
            <tr
              key={rowIdx}
              style={{
                borderBottom: '1px solid var(--c-border)',
                transition: 'background-color 0.15s ease',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'var(--c-primary-soft)')}
              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
            >
              {columns.map((col, colIdx) => (
                <td
                  key={colIdx}
                  style={{
                    padding: '12px 16px',
                    fontSize: '13px',
                    color: 'var(--c-text)',
                  }}
                >
                  {typeof col.accessor === 'function'
                    ? col.accessor(item)
                    : (item[col.accessor] as ReactNode)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function Thead({ children }: { children: ReactNode }) {
  return (
    <thead
      style={{
        backgroundColor: 'var(--c-primary-soft)',
        borderBottom: '1px solid var(--c-border)',
      }}
    >
      {children}
    </thead>
  );
}

export function Tbody({ children }: { children: ReactNode }) {
  return <tbody>{children}</tbody>;
}

export function Tr({ children }: { children: ReactNode }) {
  return (
    <tr style={{ borderBottom: '1px solid var(--c-border)' }}>{children}</tr>
  );
}

export function Th({ children }: { children: ReactNode }) {
  return (
    <th
      style={{
        padding: '12px 16px',
        textAlign: 'left',
        fontWeight: 600,
        color: 'var(--c-text)',
      }}
    >
      {children}
    </th>
  );
}

export function Td({ children }: { children: ReactNode }) {
  return (
    <td
      style={{
        padding: '12px 16px',
        color: 'var(--c-text)',
      }}
    >
      {children}
    </td>
  );
}
