import { 
  Client,
  JobCardApprovalResponseApiResponse,
  ApprovalResponseIReadOnlyListApiResponse,
  ApprovalCreateRequest,
  ApproveRequest
} from '@/api/generated/apiClient';
import { createClient } from './_repoBase';
import { normalizeError } from './_errors';

const client = createClient(Client);

export const approvalsRepo = {
  async list(targetType?: string, targetId?: string): Promise<ApprovalResponseIReadOnlyListApiResponse> {
    try {
      return await client.approvalsGET(targetType, targetId);
    } catch (error) {
      throw normalizeError(error);
    }
  },

  async create(body: ApprovalCreateRequest): Promise<JobCardApprovalResponseApiResponse> {
    try {
      return await client.approvalsPOST(body);
    } catch (error) {
      throw normalizeError(error);
    }
  },

  async listByJobCard(id: string): Promise<ApprovalResponseIReadOnlyListApiResponse> {
    try {
      return await client.approvalsGET2(id);
    } catch (error) {
      throw normalizeError(error);
    }
  },

  async approveSupervisor(id: string, body: ApproveRequest): Promise<JobCardApprovalResponseApiResponse> {
    try {
      return await client.approveSupervisor(id, body);
    } catch (error) {
      throw normalizeError(error);
    }
  },

  async approveCashier(id: string, body: ApproveRequest): Promise<JobCardApprovalResponseApiResponse> {
    try {
      return await client.approveCashier(id, body);
    } catch (error) {
      throw normalizeError(error);
    }
  }
};
