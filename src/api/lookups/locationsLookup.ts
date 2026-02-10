import { Client } from '../generated/apiClient';
import { createClient } from '../repositories/_repoBase';
import { lookupsCache } from './lookupsCache';

const client = createClient(Client);

export async function getLocationsOnce() {
  if (lookupsCache.locations.length > 0) {
    return lookupsCache.locations;
  }

  try {
    const response = await client.locationsGET(1, 1000);
    if (response.success && response.data?.items) {
      lookupsCache.locations = response.data.items.map(l => ({
        id: l.id!,
        name: l.name!,
        ...l
      }));
    }
    return lookupsCache.locations;
  } catch (error) {
    console.error('Failed to load locations lookup:', error);
    return [];
  }
}
