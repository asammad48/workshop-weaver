import { 
  Client, 
  JobLineItemResponseIReadOnlyListApiResponse, 
  JobLineItemResponseApiResponse, 
  JobLineItemCreateRequest,
  BooleanApiResponse
} from '@/api/generated/apiClient';
import { createClient } from './_repoBase';
import { normalizeError } from './_errors';

const client = createClient(Client);

export const lineItemsRepo = {
  async list(jobCardId: string): Promise<JobLineItemResponseIReadOnlyListApiResponse> {
    try {
      return await client.lineItemsGET(jobCardId);
    } catch (error) {
      throw normalizeError(error);
    }
  },

  async create(jobCardId: string, body: JobLineItemCreateRequest): Promise<JobLineItemResponseApiResponse> {
    try {
      return await client.lineItemsPOST(jobCardId, body);
    } catch (error) {
      throw normalizeError(error);
    }
  },

  async delete(id: string): Promise<BooleanApiResponse> {
    try {
      return await client.lineItemsDELETE(id);
    } catch (error) {
      throw normalizeError(error);
    }
  }
};
