import { usersRepo } from '../repositories/usersRepo';
import { UserRole } from '@/constants/enums';

/**
 * In-memory lookup cache for users.
 */
export const usersCache = {
  users: [] as any[],
  lastLoaded: 0,
};

/**
 * Loads users into memory cache if not already loaded or expired (5 mins).
 */
export async function getUsersOnce() {
  const now = Date.now();
  if (usersCache.users.length > 0 && (now - usersCache.lastLoaded) < 300000) {
    return usersCache.users;
  }

  try {
    const response = await usersRepo.list(1, 1000); // Load up to 1000 users
    if (response.success && response.data?.items) {
      usersCache.users = response.data.items;
      usersCache.lastLoaded = now;
    }
    return usersCache.users;
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
