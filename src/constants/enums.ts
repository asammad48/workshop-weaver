import { UserRole as ApiUserRole } from '@/api/generated/apiClient';

export enum JobTaskStatus {
  PENDING = 1,
  IN_PROGRESS = 2,
  DONE = 3,
  BLOCKED = 4
}

export const JOB_TASK_STATUS_LABELS: Record<number, string> = {
  [JobTaskStatus.PENDING]: 'Pending',
  [JobTaskStatus.IN_PROGRESS]: 'In Progress',
  [JobTaskStatus.DONE]: 'Done',
  [JobTaskStatus.BLOCKED]: 'Blocked',
};

export enum JobCardStatus {
  NUEVA_SOLICITUD = 0,
  PEDIDO_REALIZADO = 1,
  PEDIDO_RECIBIDO = 2,
  ESPERANDO_APROBACION = 3,
  EN_PROCESO = 4,
  CLIENTE_INFORMADO = 5,
  LISTO_PARA_RECOGER = 6,
  PAGADO = 7
}

export const JOB_CARD_STATUS_LABELS: Record<number, string> = {
  [JobCardStatus.NUEVA_SOLICITUD]: 'New Request',
  [JobCardStatus.PEDIDO_REALIZADO]: 'Order Placed',
  [JobCardStatus.PEDIDO_RECIBIDO]: 'Order Received',
  [JobCardStatus.ESPERANDO_APROBACION]: 'Awaiting Approval',
  [JobCardStatus.EN_PROCESO]: 'In Progress',
  [JobCardStatus.CLIENTE_INFORMADO]: 'Client Informed',
  [JobCardStatus.LISTO_PARA_RECOGER]: 'Ready for Pickup',
  [JobCardStatus.PAGADO]: 'Paid',
};

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
