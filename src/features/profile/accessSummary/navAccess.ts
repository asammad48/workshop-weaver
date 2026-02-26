import { getNav } from '@/app/nav';

export function flattenNav(navGroups: any[]) {
  const flat: any[] = [];
  navGroups.forEach(group => {
    group.items.forEach((item: any) => {
      flat.push({
        ...item,
        groupLabel: group.label
      });
    });
  });
  return flat;
}

export function canUserAccess(path: string, userRole: string | undefined) {
  // In this app, access is already filtered by getNav based on rolePageAccess in nav.ts
  // So we just check if it's in the returned nav for that role
  const nav = getNav(userRole);
  return nav.some(group => group.items.some(item => item.path === path));
}
