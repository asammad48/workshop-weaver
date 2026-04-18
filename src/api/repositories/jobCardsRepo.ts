import {
  Client,
  JobCardResponsePageResponseApiResponse,
  JobCardResponseApiResponse,
  JobCardCreateRequest,
  JobCardStatusChangeRequest,
  JobCardDiagnosisUpdateRequest,
} from "@/api/generated/apiClient";
import { createClient } from "./_repoBase";
import { normalizeError } from "./_errors";
import { getBaseUrl } from "../clientFactory";
import { useI18nStore } from "@/state/i18nStore";

const client = createClient(Client);

export const jobCardsRepo = {
  async list(
    pageNumber?: number,
    pageSize?: number,
    search?: string,
    sortBy?: string,
    sortDirection?: string,
    fromDate?: Date,
    toDate?: Date,
  ): Promise<JobCardResponsePageResponseApiResponse> {
    try {
      return await client.jobcardsGET2(
        pageNumber,
        pageSize,
        search,
        sortBy,
        sortDirection,
        fromDate,
        toDate,
      );
    } catch (error) {
      throw normalizeError(error);
    }
  },

  async get(id: string): Promise<JobCardResponseApiResponse> {
    try {
      return await client.jobcardsGET3(id);
    } catch (error) {
      throw normalizeError(error);
    }
  },

  async create(
    body: JobCardCreateRequest | any,
  ): Promise<JobCardResponseApiResponse> {
    try {
      return await client.jobcardsPOST(body as JobCardCreateRequest);
    } catch (error) {
      throw normalizeError(error);
    }
  },

  async checkIn(id: string): Promise<JobCardResponseApiResponse> {
    try {
      return await client.checkIn2(id);
    } catch (error) {
      throw normalizeError(error);
    }
  },

  async checkOut(id: string): Promise<JobCardResponseApiResponse> {
    try {
      return await client.checkOut2(id);
    } catch (error) {
      throw normalizeError(error);
    }
  },

  async status(
    id: string,
    body?: JobCardStatusChangeRequest,
  ): Promise<JobCardResponseApiResponse> {
    try {
      return await client.statusPOST(id, body);
    } catch (error) {
      throw normalizeError(error);
    }
  },

  async diagnosis(
    id: string,
    body?: JobCardDiagnosisUpdateRequest,
  ): Promise<JobCardResponseApiResponse> {
    try {
      return await client.diagnosis(id, body);
    } catch (error) {
      throw normalizeError(error);
    }
  },

  async getPartRequests(jobCardId: string): Promise<any> {
    try {
      return await client.partRequestsGET(jobCardId);
    } catch (error) {
      throw normalizeError(error);
    }
  },

  async openPrint(jobCardId: string): Promise<void> {
    const url = `${getBaseUrl()}/public/receipt/jobcards/${jobCardId}/print`;
    const language = useI18nStore.getState().language === "es" ? "es" : "en";

    const response = await fetch(url, {
      headers: {
        "Accept-Language": language,
      },
    });

    if (!response.ok) {
      throw normalizeError(response);
    }

    const blob = await response.blob();
    const blobUrl = URL.createObjectURL(blob);
    window.open(blobUrl, "_blank");
  },
};
