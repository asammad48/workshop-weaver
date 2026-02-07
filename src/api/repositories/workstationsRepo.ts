import { 
  Client, 
  WorkStationResponsePageResponseApiResponse, 
  WorkStationResponseApiResponse, 
  WorkStationCreateRequest 
} from '@/api/generated/apiClient';
import { createClient } from './_repoBase';
import { normalizeError } from './_errors';

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
      return await client.workstationsPOST(body);
    } catch (error) {
      throw normalizeError(error);
    }
  }
};
