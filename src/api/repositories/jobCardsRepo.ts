import { 
  Client, 
  JobCardResponsePageResponseApiResponse, 
  JobCardResponseApiResponse, 
  JobCardCreateRequest 
} from '@/api/generated/apiClient';
import { createClient } from './_repoBase';
import { normalizeError } from './_errors';

const client = createClient(Client);

export const jobCardsRepo = {
  async list(pageNumber?: number, pageSize?: number, search?: string, sortBy?: string, sortDirection?: string): Promise<JobCardResponsePageResponseApiResponse> {
    try {
      return await client.jobcardsGET(pageNumber, pageSize, search, sortBy, sortDirection);
    } catch (error) {
      throw normalizeError(error);
    }
  },

  async get(id: string): Promise<JobCardResponseApiResponse> {
    try {
      return await client.jobcardsGET2(id);
    } catch (error) {
      throw normalizeError(error);
    }
  },

  async create(body: JobCardCreateRequest): Promise<JobCardResponseApiResponse> {
    try {
      return await client.jobcardsPOST(body);
    } catch (error) {
      throw normalizeError(error);
    }
  },

  async checkIn(id: string): Promise<JobCardResponseApiResponse> {
    try {
      return await client.checkIn(id);
    } catch (error) {
      throw normalizeError(error);
    }
  },

  async checkOut(id: string): Promise<JobCardResponseApiResponse> {
    try {
      return await client.checkOut(id);
    } catch (error) {
      throw normalizeError(error);
    }
  }
};
