import { usersRepo } from '../repositories/usersRepo';
import { UserRole } from '@/constants/enums';
import { lookupsCache } from './lookupsCache';

/**
 * Loads users into memory cache if not already loaded.
 */
export async function getUsersOnce() {
  if (lookupsCache.users.length > 0) {
    return lookupsCache.users;
  }

  try {
    const response = await usersRepo.list(1, 1000); // Load up to 1000 users
    if (response.success && response.data?.items) {
      lookupsCache.users = response.data.items.map(u => ({
        id: u.id!,
        name: u.fullName!,
        ...u
      }));
    }
    return lookupsCache.users;
  } catch (error) {
    console.error('Failed to load users lookup:', error);
    return [];
  }
}

/**
 * Returns only users with the Technician role.
 */
export async function getTechnicians() {
  const users = await getUsersOnce();
  return users.filter(u => u.role === UserRole.TECHNICIAN);
}
