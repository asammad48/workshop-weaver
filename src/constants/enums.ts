export enum UserRole {
  HQ_ADMIN = 1,
  BRANCH_MANAGER = 2,
  STOREKEEPER = 3,
  CASHIER = 4,
  TECHNICIAN = 5,
  RECEPTIONIST = 6,
}

export const USER_ROLE_LABELS: Record<number, string> = {
  [UserRole.HQ_ADMIN]: 'HQ Admin',
  [UserRole.BRANCH_MANAGER]: 'Branch Manager',
  [UserRole.STOREKEEPER]: 'Storekeeper',
  [UserRole.CASHIER]: 'Cashier',
  [UserRole.TECHNICIAN]: 'Technician',
  [UserRole.RECEPTIONIST]: 'Receptionist',
};

export const USER_ROLE_OPTIONS = Object.entries(USER_ROLE_LABELS).map(([value, label]) => ({
  value: Number(value),
  label,
}));

export function requireBranchForRole(role: number): boolean {
  return role !== UserRole.HQ_ADMIN;
}
