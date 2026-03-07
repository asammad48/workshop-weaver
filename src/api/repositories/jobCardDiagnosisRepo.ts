import {
  Client,
  JobCardDiagnosisLogCreateRequest,
  JobCardDiagnosisLogResponseApiResponse,
  JobCardDiagnosisTimelineResponseApiResponse,
} from "@/api/generated/apiClient";
import { createClient } from "./_repoBase";
import { normalizeError } from "./_errors";

const client = createClient(Client);

export const jobCardDiagnosisRepo = {
  async create(
    jobCardId: string,
    body: JobCardDiagnosisLogCreateRequest
  ): Promise<JobCardDiagnosisLogResponseApiResponse> {
    try {
      return await client.diagnosisLogsPOST(jobCardId, body);
    } catch (error) {
      throw normalizeError(error);
    }
  },

  async getTimeline(
    jobCardId: string
  ): Promise<JobCardDiagnosisTimelineResponseApiResponse> {
    try {
      return await client.diagnosisLogsGET(jobCardId);
    } catch (error) {
      throw normalizeError(error);
    }
  },
};
