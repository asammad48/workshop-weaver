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
      return await client.use(jobCardId, body);
    } catch (error) {
      throw normalizeError(error);
    }
  }
};
