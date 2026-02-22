import { useMemo } from 'react';
import { Card } from '@/components/ui/Card';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';
import { ChartSeriesDto } from '@/api/generated/apiClient';

interface ChartCardProps {
  title: string;
  series: ChartSeriesDto[];
  type?: 'line' | 'bar';
}

export function ChartCard({ title, series, type = 'line' }: ChartCardProps) {
  const chartData = useMemo(() => {
    const dataMap: Record<string, any> = {};
    const seriesKeys: string[] = [];

    series.forEach(s => {
      const key = s.key || 'value';
      seriesKeys.push(key);
      s.points?.forEach(p => {
        const dateStr = p.date ? new Date(p.date).toLocaleDateString() : 'Unknown';
        if (!dataMap[dateStr]) {
          dataMap[dateStr] = { date: dateStr };
        }
        dataMap[dateStr][key] = p.value || 0;
      });
    });

    // Fill missing values with 0
    const result = Object.values(dataMap).sort((a, b) => {
      return new Date(a.date).getTime() - new Date(b.date).getTime();
    });

    result.forEach(item => {
      seriesKeys.forEach(key => {
        if (item[key] === undefined) {
          item[key] = 0;
        }
      });
    });

    return result;
  }, [series]);

  const colors = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

  return (
    <Card style={{ padding: '20px', height: '400px', display: 'flex', flexDirection: 'column' }}>
      <div style={{ fontSize: '16px', fontWeight: 600, color: 'var(--c-text)', marginBottom: '20px' }}>
        {title}
      </div>
      <div style={{ flex: 1, minHeight: 0 }}>
        <ResponsiveContainer width="100%" height="100%">
          {type === 'line' ? (
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--c-border)" />
              <XAxis
                dataKey="date"
                axisLine={false}
                tickLine={false}
                tick={{ fill: 'var(--c-muted)', fontSize: 12 }}
                dy={10}
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{ fill: 'var(--c-muted)', fontSize: 12 }}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'var(--c-card)',
                  borderColor: 'var(--c-border)',
                  borderRadius: '8px',
                  color: 'var(--c-text)'
                }}
              />
              <Legend wrapperStyle={{ paddingTop: '20px' }} />
              {series.map((s, i) => (
                <Line
                  key={s.key}
                  type="monotone"
                  dataKey={s.key || 'value'}
                  name={s.label || s.key}
                  stroke={colors[i % colors.length]}
                  strokeWidth={2}
                  dot={{ r: 4 }}
                  activeDot={{ r: 6 }}
                />
              ))}
            </LineChart>
          ) : (
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--c-border)" />
              <XAxis
                dataKey="date"
                axisLine={false}
                tickLine={false}
                tick={{ fill: 'var(--c-muted)', fontSize: 12 }}
                dy={10}
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{ fill: 'var(--c-muted)', fontSize: 12 }}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'var(--c-card)',
                  borderColor: 'var(--c-border)',
                  borderRadius: '8px',
                  color: 'var(--c-text)'
                }}
              />
              <Legend wrapperStyle={{ paddingTop: '20px' }} />
              {series.map((s, i) => (
                <Bar
                  key={s.key}
                  dataKey={s.key || 'value'}
                  name={s.label || s.key}
                  fill={colors[i % colors.length]}
                  radius={[4, 4, 0, 0]}
                />
              ))}
            </BarChart>
          )}
        </ResponsiveContainer>
      </div>
    </Card>
  );
}
