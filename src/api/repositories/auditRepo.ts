import { 
  Client, 
  AuditLogResponsePageResponseApiResponse,
  AuditLogResponse
} from '@/api/generated/apiClient';
import { createClient } from './_repoBase';
import { normalizeError } from './_errors';

const client = createClient(Client);

export interface ExtendedAuditLogResponse extends AuditLogResponse {
  actorEmail?: string;
  message?: string;
}

export interface ExtendedAuditLogPageResponseApiResponse extends Omit<AuditLogResponsePageResponseApiResponse, 'data'> {
  data?: {
    items?: ExtendedAuditLogResponse[];
    totalCount?: number;
    pageNumber?: number;
    pageSize?: number;
  };
}

export const auditRepo = {
  async list(
    pageNumber?: number, 
    pageSize?: number, 
    search?: string, 
    sortBy?: string, 
    sortDirection?: string, 
    branchId?: string
  ): Promise<ExtendedAuditLogPageResponseApiResponse> {
    try {
      return await client.audit(pageNumber, pageSize, search, sortBy, sortDirection, branchId) as ExtendedAuditLogPageResponseApiResponse;
    } catch (error) {
      throw normalizeError(error);
    }
  }
};
