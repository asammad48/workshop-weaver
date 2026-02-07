/**
 * In-memory lookup cache for dropdown data.
 * Used to avoid redundant API calls for static or slow-changing data.
 */

interface LookupItem {
  id: string;
  name: string;
  [key: string]: any;
}

export const lookupsCache = {
  branches: [] as LookupItem[],
  customers: [] as LookupItem[],
  parts: [] as LookupItem[],
  locations: [] as LookupItem[],
  vehicles: [] as LookupItem[],
};

/**
 * Helper to check if a specific lookup is loaded
 */
export function isLookupLoaded(key: keyof typeof lookupsCache): boolean {
  return lookupsCache[key].length > 0;
}
