import { 
  Client,
  CommunicationLogResponseIReadOnlyListApiResponse,
  CommunicationLogCreateRequest,
  CommunicationLogResponseApiResponse
} from '@/api/generated/apiClient';
import { createClient } from './_repoBase';
import { normalizeError } from './_errors';

const client = createClient(Client);

export const commsRepo = {
  async listByJobCard(jobCardId: string): Promise<CommunicationLogResponseIReadOnlyListApiResponse> {
    try {
      return await client.communicationsGET(jobCardId);
    } catch (error) {
      throw normalizeError(error);
    }
  },

  async create(body: CommunicationLogCreateRequest): Promise<CommunicationLogResponseApiResponse> {
    try {
      return await client.communicationsPOST(body);
    } catch (error) {
      throw normalizeError(error);
    }
  }
};
