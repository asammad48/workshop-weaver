/**
 * In-memory lookup cache for dropdown data.
 * Used to avoid redundant API calls for static or slow-changing data.
 */

export interface LookupItem {
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
  suppliers: [] as LookupItem[],
  users: [] as LookupItem[],
  workstations: [] as LookupItem[],
};

/**
 * Helper to check if a specific lookup is loaded
 */
export function isLookupLoaded(key: keyof typeof lookupsCache): boolean {
  return lookupsCache[key].length > 0;
}

/**
 * Updates an item in the cache or adds it if it doesn't exist.
 * Only performs the update if the cache for that key is already populated.
 */
export function updateLookupCache(key: keyof typeof lookupsCache, item: any) {
  if (!isLookupLoaded(key)) return;

  const id = item.id;
  let name = item.name;

  if (key === 'customers' || key === 'users') {
    name = item.fullName || item.name;
  } else if (key === 'vehicles') {
    name = item.plate ? `${item.plate} - ${item.make} ${item.model}` : item.name;
  }

  const mappedItem: LookupItem = { ...item, id, name };

  const index = lookupsCache[key].findIndex(i => i.id === id);
  if (index !== -1) {
    lookupsCache[key][index] = mappedItem;
  } else {
    lookupsCache[key].push(mappedItem);
  }
}
