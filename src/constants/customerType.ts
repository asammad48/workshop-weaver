export const CUSTOMER_TYPE_OPTIONS = [
  { value: '1', label: 'Simple' },
  { value: '2', label: 'Fleet' },
] as const;

export function getCustomerTypeLabel(value: string | number | null | undefined): string {
  if (value === 2 || value === '2' || `${value}`.toLowerCase() === 'fleet') {
    return 'Fleet';
  }
  if (value === 1 || value === '1' || `${value}`.toLowerCase() === 'simple') {
    return 'Simple';
  }
  return '-';
}
