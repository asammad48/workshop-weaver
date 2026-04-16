import {
    LayoutDashboard,
    Wrench,
    Users,
    IdCard,
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
    labelKey?: string;
    icon: LucideIcon;
    readOnly?: boolean;
}

export interface NavGroup {
    label: string;
    labelKey?: string;
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
        labelKey: "nav.groups.main",
        items: [{ path: "/", label: "Dashboard", labelKey: "nav.items.dashboard", icon: LayoutDashboard }],
    },
    {
        label: "Operations",
        labelKey: "nav.groups.operations",
        items: [
            { path: "/customers", label: "Customers", labelKey: "nav.items.customers", icon: Users },
            { path: "/customers/drivers", label: "Drivers", labelKey: "nav.items.drivers", icon: IdCard },
            { path: "/vehicles", label: "Vehicles", labelKey: "nav.items.vehicles", icon: Car },
            { path: "/jobcards", label: "Job Cards", labelKey: "nav.items.jobCards", icon: Wrench },
        ],
    },
    {
        label: "Inventory",
        labelKey: "nav.groups.inventory",
        items: [{ path: "/inventory", label: "Inventory", labelKey: "nav.items.inventory", icon: Package }],
    },
    {
        label: "Purchasing",
        labelKey: "nav.groups.purchasing",
        items: [
            {
                path: "/inventory/purchase-orders",
                label: "Purchase Orders",
                labelKey: "nav.items.purchaseOrders",
                icon: ShoppingCart,
            },
        ],
    },
    {
        label: "Transfers",
        labelKey: "nav.groups.transfers",
        items: [
            {
                path: "/inventory/transfers",
                label: "Transfers",
                labelKey: "nav.items.transfers",
                icon: ArrowLeftRight,
            },
        ],
    },
    {
        label: "Finance",
        labelKey: "nav.groups.finance",
        items: [{ path: "/finance", label: "Finance", labelKey: "nav.items.finance", icon: DollarSign }],
    },
    {
        label: "Reports",
        labelKey: "nav.groups.reports",
        items: [{ path: "/reports", label: "Reports", labelKey: "nav.items.reports", icon: BarChart3 }],
    },
    {
        label: "Attendance",
        labelKey: "nav.groups.attendance",
        items: [
            { path: "/attendance/me", label: "My Attendance", labelKey: "nav.items.myAttendance", icon: Clock },
            { path: "/attendance", label: "Attendance", labelKey: "nav.items.attendance", icon: CalendarCheck },
        ],
    },
    {
        label: "Admin",
        labelKey: "nav.groups.admin",
        items: [
            { path: "/admin/branches", label: "Branches", labelKey: "nav.items.branches", icon: Building2 },
            { path: "/admin/users", label: "Users", labelKey: "nav.items.users", icon: UserCog },
            { path: "/admin/workstations", label: "Workstations", labelKey: "nav.items.workstations", icon: Monitor },
            { path: "/admin/audit", label: "Audit", labelKey: "nav.items.audit", icon: FileText },
        ],
    },
    {
        label: "Profile",
        labelKey: "nav.groups.profile",
        items: [
            { path: "/me", label: "Profile", labelKey: "nav.items.profile", icon: User },
            { path: "/theme", label: "Theme", labelKey: "nav.items.theme", icon: Palette },
        ],
    },
];

// Role-based access configuration
const rolePageAccess: Record<UserRole, string[]> = {
    HQ_ADMIN: [
        "/",
        "/attendance/me",
        "/attendance",
        "/admin/users",
        "/admin/branches",
        "/admin/audit",
        "/me",
        "/theme",
    ],
    BRANCH_MANAGER: [
        "/",
        "/jobcards",
        "/customers",
        "/customers/drivers",
        "/vehicles",
        "/inventory",
        "/inventory/purchase-orders",
        "/inventory/transfers",
        "/finance",
        "/reports",
        "/attendance/me",
        "/attendance",
        "/me",
        "/admin/workstations",
        "/theme",
    ],
    STOREKEEPER: [
        "/",
        "/jobcards",
        "/customers",
        "/customers/drivers",
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
        "/customers/drivers",
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
