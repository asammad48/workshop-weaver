import { 
  Client, 
  CustomerResponsePageResponseApiResponse, 
  CustomerResponseApiResponse, 
  CustomerCreateRequest 
} from '@/api/generated/apiClient';
import { createClient } from './_repoBase';
import { normalizeError } from './_errors';

const client = createClient(Client);

export const customersRepo = {
  async list(pageNumber?: number, pageSize?: number, search?: string, sortBy?: string, sortDirection?: string): Promise<CustomerResponsePageResponseApiResponse> {
    try {
      return await client.customersGET(pageNumber, pageSize, search, sortBy, sortDirection);
    } catch (error) {
      throw normalizeError(error);
    }
  },

  async get(id: string): Promise<CustomerResponseApiResponse> {
    try {
      return await client.customersGET2(id);
    } catch (error) {
      throw normalizeError(error);
    }
  },

  async create(body: CustomerCreateRequest): Promise<CustomerResponseApiResponse> {
    try {
      return await client.customersPOST(body);
    } catch (error) {
      throw normalizeError(error);
    }
  }
};
