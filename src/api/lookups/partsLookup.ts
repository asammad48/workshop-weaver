import { Client } from '../generated/apiClient';
import { createClient } from '../repositories/_repoBase';
import { lookupsCache } from './lookupsCache';

const client = createClient(Client);

export async function getPartsOnce() {
  if (lookupsCache.parts.length > 0) {
    return lookupsCache.parts;
  }

  try {
    const response = await client.partsGET(1, 1000);
    if (response.success && response.data?.items) {
      lookupsCache.parts = response.data.items.map(p => ({
        id: p.id!,
        name: p.name!,
        ...p
      }));
    }
    return lookupsCache.parts;
  } catch (error) {
    console.error('Failed to load parts lookup:', error);
    return [];
  }
}
