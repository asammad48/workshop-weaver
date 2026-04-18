export const CUSTOMER_TYPE_OPTIONS = [
  { value: '1', label: 'Simple' },
  { value: '2', label: 'Fleet' },
] as const;

export function isFleetCustomerType(value: string | number | null | undefined): boolean {
  const normalized = `${value ?? ''}`.trim().toLowerCase();
  return normalized === '2' || normalized === 'fleet';
}

export function getCustomerTypeLabel(value: string | number | null | undefined): string {
  if (isFleetCustomerType(value)) {
    return 'Fleet';
  }
  if (value === 1 || value === '1' || `${value}`.toLowerCase() === 'simple') {
    return 'Simple';
  }
  return '-';
}
