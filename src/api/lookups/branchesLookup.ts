import { branchesRepo } from '../repositories/branchesRepo';
import { lookupsCache } from './lookupsCache';

/**
 * Loads branches into memory cache if not already loaded.
 * Returns the cached branches.
 */
export async function getBranchesOnce() {
  if (lookupsCache.branches.length > 0) {
    return lookupsCache.branches;
  }

  try {
    const response = await branchesRepo.list(1, 1000); // Load all branches
    if (response.success && response.data?.items) {
      lookupsCache.branches = response.data.items.map(b => ({
        id: b.id!,
        name: b.name!,
        ...b
      }));
    }
    return lookupsCache.branches;
  } catch (error) {
    console.error('Failed to load branches lookup:', error);
    return [];
  }
}

/**
 * Get a map of branch ID to branch object for quick lookups
 */
export function getBranchMap() {
  return Object.fromEntries(lookupsCache.branches.map(b => [b.id, b]));
}
