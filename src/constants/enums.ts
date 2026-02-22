import { UserRole as ApiUserRole } from "@/api/generated/apiClient";

export enum JobTaskStatus {
  PENDING = 1,
  IN_PROGRESS = 2,
  DONE = 3,
  BLOCKED = 4,
}

export const JOB_TASK_STATUS_LABELS: Record<number, string> = {
  [JobTaskStatus.PENDING]: "Pending",
  [JobTaskStatus.IN_PROGRESS]: "In Progress",
  [JobTaskStatus.DONE]: "Done",
  [JobTaskStatus.BLOCKED]: "Blocked",
};

export enum JobCardStatus {
  NUEVA_SOLICITUD = 0,
  PEDIDO_REALIZADO = 1,
  PEDIDO_RECIBIDO = 2,
  ESPERANDO_APROBACION = 3,
  EN_PROCESO = 4,
  CLIENTE_INFORMADO = 5,
  LISTO_PARA_RECOGER = 6,
  PAGADO = 7,
}

export const JOB_CARD_STATUS_LABELS: Record<number, string> = {
  [JobCardStatus.NUEVA_SOLICITUD]: "New Request",
  [JobCardStatus.PEDIDO_REALIZADO]: "Order Placed",
  [JobCardStatus.PEDIDO_RECIBIDO]: "Order Received",
  [JobCardStatus.ESPERANDO_APROBACION]: "Awaiting Approval",
  [JobCardStatus.EN_PROCESO]: "In Progress",
  [JobCardStatus.CLIENTE_INFORMADO]: "Client Informed",
  [JobCardStatus.LISTO_PARA_RECOGER]: "Ready for Pickup",
  [JobCardStatus.PAGADO]: "Paid",
};

export class Roles {
  static readonly HQ_ADMIN = "HQ_ADMIN";
  static readonly BRANCH_MANAGER = "BRANCH_MANAGER";
  static readonly STOREKEEPER = "STOREKEEPER";
  static readonly CASHIER = "CASHIER";
  static readonly TECHNICIAN = "TECHNICIAN";
  static readonly RECEPTIONIST = "RECEPTIONIST";
}

export enum UserRole {
  HQ_ADMIN = ApiUserRole._1,
  BRANCH_MANAGER = ApiUserRole._2,
  STOREKEEPER = ApiUserRole._3,
  CASHIER = ApiUserRole._4,
  TECHNICIAN = ApiUserRole._5,
  RECEPTIONIST = ApiUserRole._6,
}

export const USER_ROLE_LABELS: Record<number, string> = {
  [UserRole.HQ_ADMIN]: "HQ Admin",
  [UserRole.BRANCH_MANAGER]: "Branch Manager",
  [UserRole.STOREKEEPER]: "Storekeeper",
  [UserRole.CASHIER]: "Cashier",
  [UserRole.TECHNICIAN]: "Technician",
  [UserRole.RECEPTIONIST]: "Receptionist",
};

export const USER_ROLE_OPTIONS = Object.entries(USER_ROLE_LABELS).map(
  ([value, label]) => ({
    value: Number(value),
    label,
  }),
);

export enum AttendanceStatus {
  PRESENT = 1,
  ABSENT = 2,
  LATE = 3,
  LEAVE = 4,
}

export const ATTENDANCE_STATUS_LABELS: Record<number, string> = {
  [AttendanceStatus.PRESENT]: "Present",
  [AttendanceStatus.ABSENT]: "Absent",
  [AttendanceStatus.LATE]: "Late",
  [AttendanceStatus.LEAVE]: "Leave",
};

export const ATTENDANCE_STATUS_OPTIONS = Object.entries(ATTENDANCE_STATUS_LABELS).map(
  ([value, label]) => ({
    value: Number(value),
    label,
  }),
);

export function requireBranchForRole(role: number): boolean {
  return role !== UserRole.HQ_ADMIN;
}

export enum RoadblockerType {
  PARTS = 1,
  CUSTOMER = 2,
  TECHNICAL = 3,
  WORKSTATION = 4,
  OTHER = 99,
}

export const ROADBLOCKER_TYPE_LABELS: Record<number, string> = {
  [RoadblockerType.PARTS]: "Parts",
  [RoadblockerType.CUSTOMER]: "Customer",
  [RoadblockerType.TECHNICAL]: "Technical",
  [RoadblockerType.WORKSTATION]: "Workstation",
  [RoadblockerType.OTHER]: "Other",
};

export const ROADBLOCKER_TYPE_OPTIONS = Object.entries(ROADBLOCKER_TYPE_LABELS).map(
  ([value, label]) => ({
    value: Number(value),
    label,
  }),
);

export enum PaymentMethod {
  CASH = 1,
  CARD = 2,
  TRANSFER = 3,
  CHEQUE = 4,
}

export const PAYMENT_METHOD_LABELS: Record<number, string> = {
  [PaymentMethod.CASH]: "Cash",
  [PaymentMethod.CARD]: "Card",
  [PaymentMethod.TRANSFER]: "Transfer",
  [PaymentMethod.CHEQUE]: "Cheque",
};

export const PAYMENT_METHOD_OPTIONS = Object.entries(PAYMENT_METHOD_LABELS).map(
  ([value, label]) => ({
    value: Number(value),
    label,
  }),
);
