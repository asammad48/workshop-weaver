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
  FileText,
  User,
  Palette,
  LucideIcon
} from 'lucide-react';

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

type UserRole = 'HQ_ADMIN' | 'MANAGER' | 'STORE' | 'CASHIER' | 'TECH';

// Full navigation structure
const allNavGroups: NavGroup[] = [
  {
    label: 'Main',
    items: [
      { path: '/', label: 'Dashboard', icon: LayoutDashboard },
    ],
  },
  {
    label: 'Operations',
    items: [
      { path: '/jobcards', label: 'Job Cards', icon: Wrench },
      { path: '/customers', label: 'Customers', icon: Users },
      { path: '/vehicles', label: 'Vehicles', icon: Car },
    ],
  },
  {
    label: 'Inventory',
    items: [
      { path: '/inventory', label: 'Inventory', icon: Package },
      { path: '/inventory/purchase-orders', label: 'Purchase Orders', icon: ShoppingCart },
      { path: '/inventory/transfers', label: 'Transfers', icon: ArrowLeftRight },
    ],
  },
  {
    label: 'Finance',
    items: [
      { path: '/finance', label: 'Finance', icon: DollarSign },
    ],
  },
  {
    label: 'Reports',
    items: [
      { path: '/reports', label: 'Reports', icon: BarChart3 },
    ],
  },
  {
    label: 'Admin',
    items: [
      { path: '/admin/users', label: 'Users', icon: UserCog },
      { path: '/admin/branches', label: 'Branches', icon: Building2 },
      { path: '/admin/audit', label: 'Audit', icon: FileText },
    ],
  },
  {
    label: 'Profile',
    items: [
      { path: '/me', label: 'Profile', icon: User },
      { path: '/theme', label: 'Theme', icon: Palette },
    ],
  },
];

// Role-based access configuration
const roleAccess: Record<UserRole, { groups: string[]; readOnlyGroups?: string[] }> = {
  HQ_ADMIN: {
    groups: ['Main', 'Operations', 'Inventory', 'Finance', 'Reports', 'Admin', 'Profile'],
  },
  MANAGER: {
    groups: ['Main', 'Operations', 'Finance', 'Reports', 'Profile'],
  },
  STORE: {
    groups: ['Main', 'Inventory', 'Reports', 'Profile'],
    readOnlyGroups: ['Reports'],
  },
  CASHIER: {
    groups: ['Main', 'Profile'],
    readOnlyGroups: ['Finance', 'Reports'],
  },
  TECH: {
    groups: ['Main', 'Profile'],
  },
};

// Special item access for roles that need partial group access
const roleSpecialItems: Partial<Record<UserRole, string[]>> = {
  CASHIER: ['/jobcards', '/finance', '/reports'],
  TECH: ['/jobcards'],
};

/**
 * Get navigation items filtered by user role
 */
export function getNav(userRole: string | undefined): NavGroup[] {
  const role = (userRole?.toUpperCase() as UserRole) || 'TECH';
  const access = roleAccess[role] || roleAccess.TECH;
  const specialItems = roleSpecialItems[role] || [];

  const result: NavGroup[] = [];

  for (const group of allNavGroups) {
    // Check if role has access to this group
    const hasGroupAccess = access.groups.includes(group.label);
    const isReadOnlyGroup = access.readOnlyGroups?.includes(group.label);

    if (hasGroupAccess) {
      result.push({
        label: group.label,
        items: group.items.map((item) => ({
          ...item,
          readOnly: isReadOnlyGroup,
        })),
      });
      continue;
    }

    // Check for special item access (partial group access)
    const accessibleItems = group.items.filter((item) =>
      specialItems.includes(item.path)
    );

    if (accessibleItems.length > 0) {
      const isReadOnly = access.readOnlyGroups?.includes(group.label);
      result.push({
        label: group.label,
        items: accessibleItems.map((item) => ({
          ...item,
          readOnly: isReadOnly,
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
