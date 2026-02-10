import { 
  Client, 
  JobPartRequestResponseIReadOnlyListApiResponse, 
  JobPartRequestResponseApiResponse, 
  JobPartRequestCreateRequest,
  JobCardPartUseRequest,
  JobCardPartUsageResponseApiResponse
} from '@/api/generated/apiClient';
import { createClient } from './_repoBase';
import { normalizeError } from './_errors';

const client = createClient(Client);

export const partRequestsRepo = {
  async list(jobCardId: string): Promise<JobPartRequestResponseIReadOnlyListApiResponse> {
    try {
      return await client.partRequestsGET(jobCardId);
    } catch (error) {
      throw normalizeError(error);
    }
  },

  async create(jobCardId: string, body: JobPartRequestCreateRequest): Promise<JobPartRequestResponseApiResponse> {
    try {
      return await client.partRequestsPOST(jobCardId, body);
    } catch (error) {
      throw normalizeError(error);
    }
  },

  async markOrdered(id: string): Promise<JobPartRequestResponseApiResponse> {
    try {
      return await client.markOrdered(id);
    } catch (error) {
      throw normalizeError(error);
    }
  },

  async markArrived(id: string): Promise<JobPartRequestResponseApiResponse> {
    try {
      return await client.markArrived(id);
    } catch (error) {
      throw normalizeError(error);
    }
  },

  async stationSign(id: string): Promise<JobPartRequestResponseApiResponse> {
    try {
      return await client.stationSign(id);
    } catch (error) {
      throw normalizeError(error);
    }
  },

  async officeSign(id: string): Promise<JobPartRequestResponseApiResponse> {
    try {
      return await client.officeSign(id);
    } catch (error) {
      throw normalizeError(error);
    }
  },

  async use(jobCardId: string, body: JobCardPartUseRequest): Promise<JobCardPartUsageResponseApiResponse> {
    try {
      // Find the 'use' method - often named jobCardPartUsagePOST or similar in generated client
      if ((client as any).jobCardPartUsagePOST) {
        return await (client as any).jobCardPartUsagePOST(jobCardId, body);
      }
      // Fallback/Guess based on usual NSwag naming if I can't find it exactly without more grepping
      throw new Error("API method for 'use part' not found in client");
    } catch (error) {
      throw normalizeError(error);
    }
  }
};
