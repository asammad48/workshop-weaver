import { 
  Client, 
  WorkStationResponsePageResponseApiResponse, 
  WorkStationResponseApiResponse, 
  WorkStationCreateRequest 
} from '@/api/generated/apiClient';
import { createClient } from './_repoBase';
import { normalizeError } from './_errors';
import { updateLookupCache } from '../lookups/lookupsCache';

const client = createClient(Client);

export const workstationsRepo = {
  async list(pageNumber?: number, pageSize?: number, search?: string, sortBy?: string, sortDirection?: string): Promise<WorkStationResponsePageResponseApiResponse> {
    try {
      return await client.workstationsGET(pageNumber, pageSize, search, sortBy, sortDirection);
    } catch (error) {
      throw normalizeError(error);
    }
  },

  async create(body: WorkStationCreateRequest): Promise<WorkStationResponseApiResponse> {
    try {
      const res = await client.workstationsPOST(body);
      if (res.success && res.data) {
        updateLookupCache('workstations', res.data);
      }
      return res;
    } catch (error) {
      throw normalizeError(error);
    }
  }
};
