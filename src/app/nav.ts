import {
  LayoutDashboard,
  Wrench,
  Users,
  Car,
  Package,
  ShoppingCart,
  ArrowLeftRight,
  DollarSign,
  BarChart3,
  UserCog,
  Building2,
  Monitor,
  FileText,
  User,
  Palette,
  Clock,
  CalendarCheck,
  LucideIcon,
} from "lucide-react";

export interface NavItem {
  path: string;
  label: string;
  icon: LucideIcon;
  readOnly?: boolean;
}

export interface NavGroup {
  label: string;
  items: NavItem[];
}

type UserRole =
  | "HQ_ADMIN"
  | "BRANCH_MANAGER"
  | "STOREKEEPER"
  | "CASHIER"
  | "TECHNICIAN"
  | "RECEPTIONIST";

// Full navigation structure
const allNavGroups: NavGroup[] = [
  {
    label: "Main",
    items: [{ path: "/", label: "Dashboard", icon: LayoutDashboard }],
  },
  {
    label: "Operations",
    items: [
      { path: "/jobcards", label: "Job Cards", icon: Wrench },
      { path: "/customers", label: "Customers", icon: Users },
      { path: "/vehicles", label: "Vehicles", icon: Car },
    ],
  },
  {
    label: "Inventory",
    items: [{ path: "/inventory", label: "Inventory", icon: Package }],
  },
  {
    label: "Purchasing",
    items: [
      {
        path: "/inventory/purchase-orders",
        label: "Purchase Orders",
        icon: ShoppingCart,
      },
    ],
  },
  {
    label: "Transfers",
    items: [
      {
        path: "/inventory/transfers",
        label: "Transfers",
        icon: ArrowLeftRight,
      },
    ],
  },
  {
    label: "Finance",
    items: [{ path: "/finance", label: "Finance", icon: DollarSign }],
  },
  {
    label: "Reports",
    items: [{ path: "/reports", label: "Reports", icon: BarChart3 }],
  },
  {
    label: "Attendance",
    items: [
      { path: "/attendance/me", label: "My Attendance", icon: Clock },
      { path: "/attendance", label: "Attendance", icon: CalendarCheck },
    ],
  },
  {
    label: "Admin",
    items: [
      { path: "/admin/users", label: "Users", icon: UserCog },
      { path: "/admin/branches", label: "Branches", icon: Building2 },
      { path: "/admin/workstations", label: "Workstations", icon: Monitor },
      { path: "/admin/audit", label: "Audit", icon: FileText },
    ],
  },
  {
    label: "Profile",
    items: [
      { path: "/me", label: "Profile", icon: User },
      { path: "/theme", label: "Theme", icon: Palette },
    ],
  },
];

// Role-based access configuration
const rolePageAccess: Record<UserRole, string[]> = {
  HQ_ADMIN: ["*"],
  BRANCH_MANAGER: [
    "/",
    "/jobcards",
    "/customers",
    "/vehicles",
    "/inventory",
    "/inventory/purchase-orders",
    "/inventory/transfers",
    "/finance",
    "/reports",
    "/attendance/me",
    "/attendance",
    "/me",
    "/theme",
  ],
  STOREKEEPER: [
    "/",
    "/jobcards",
    "/customers",
    "/vehicles",
    "/inventory",
    "/inventory/purchase-orders",
    "/inventory/transfers",
    "/reports",
    "/attendance/me",
    "/me",
    "/theme",
  ],
  CASHIER: [
    "/",
    "/jobcards",
    "/finance",
    "/reports",
    "/attendance/me",
    "/me",
    "/theme",
  ],
  TECHNICIAN: ["/", "/jobcards", "/attendance/me", "/me", "/theme"],
  RECEPTIONIST: [
    "/",
    "/jobcards",
    "/customers",
    "/vehicles",
    "/attendance/me",
    "/me",
    "/theme",
  ],
};

const roleReadOnlyGroups: Partial<Record<UserRole, string[]>> = {
  STOREKEEPER: ["Reports"],
  CASHIER: ["Reports"],
};

/**
 * Get navigation items filtered by user role
 */
export function getNav(userRole: string | undefined): NavGroup[] {
  const role = (userRole?.toUpperCase() as UserRole) || "TECHNICIAN";
  const pageAccess = rolePageAccess[role] || rolePageAccess.TECHNICIAN;
  const readOnlyGroups = roleReadOnlyGroups[role] || [];

  const result: NavGroup[] = [];

  for (const group of allNavGroups) {
    const accessibleItems = group.items.filter(
      (item) => pageAccess.includes("*") || pageAccess.includes(item.path),
    );

    if (accessibleItems.length > 0) {
      const isReadOnlyGroup = readOnlyGroups.includes(group.label);
      result.push({
        label: group.label,
        items: accessibleItems.map((item) => ({
          ...item,
          readOnly: isReadOnlyGroup,
        })),
      });
    }
  }

  return result;
}

/**
 * Check if a path is accessible for a given role
 */
export function canAccess(userRole: string | undefined, path: string): boolean {
  const nav = getNav(userRole);
  return nav.some((group) => group.items.some((item) => item.path === path));
}
