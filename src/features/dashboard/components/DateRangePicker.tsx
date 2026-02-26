import { Input } from '@/components/ui/Input';

interface DateRangePickerProps {
  from?: Date;
  to?: Date;
  onChange: (range: { from: Date, to: Date }) => void;
}

export function DateRangePicker({ from, to, onChange }: DateRangePickerProps) {
  const handleFromChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newFrom = new Date(e.target.value);
    if (!isNaN(newFrom.getTime())) {
      onChange({ from: newFrom, to: to || new Date() });
    }
  };

  const handleToChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTo = new Date(e.target.value);
    if (!isNaN(newTo.getTime())) {
      onChange({ from: from || new Date(), to: newTo });
    }
  };

  const formatDate = (date?: Date) => {
    if (!date) return '';
    const d = new Date(date);
    return d.toISOString().split('T')[0];
  };

  return (
    <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
      <Input
        type="date"
        value={formatDate(from)}
        onChange={handleFromChange}
        style={{ width: '160px', height: '40px' }}
      />
      <Input
        type="date"
        value={formatDate(to)}
        onChange={handleToChange}
        style={{ width: '160px', height: '40px' }}
      />
    </div>
  );
}
