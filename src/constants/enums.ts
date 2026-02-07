import { UserRole as ApiUserRole } from '@/api/generated/apiClient';

export enum UserRole {
  HQ_ADMIN = ApiUserRole._1,
  BRANCH_MANAGER = ApiUserRole._2,
  STOREKEEPER = ApiUserRole._3,
  CASHIER = ApiUserRole._4,
  TECHNICIAN = ApiUserRole._5,
  RECEPTIONIST = ApiUserRole._6,
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
