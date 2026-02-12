import { Client } from '../generated/apiClient';
import { createClient } from '../repositories/_repoBase';
import { lookupsCache } from './lookupsCache';

const client = createClient(Client);

export async function getSuppliersOnce() {
  if (lookupsCache.suppliers.length > 0) {
    return lookupsCache.suppliers;
  }

  try {
    const response = await client.suppliersGET(1, 1000);
    if (response.success && response.data?.items) {
      lookupsCache.suppliers = response.data.items.map(s => ({
        id: s.id!,
        name: s.name!,
        ...s
      }));
    }
    return lookupsCache.suppliers;
  } catch (error) {
    console.error('Failed to load suppliers lookup:', error);
    return [];
  }
}
