import { 
  Client, 
  PartResponsePageResponseApiResponse
} from '@/api/generated/apiClient';
import { createClient } from '../repositories/_repoBase';
import { lookupsCache } from './lookupsCache';

const client = createClient(Client);

export async function getPartsOnce(): Promise<any[]> {
  return lookupsCache.getOrFetch('parts', async () => {
    const res = await client.partsGET(1, 1000);
    return res.data?.items || [];
  });
}
