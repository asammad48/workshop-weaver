import { Client, PublicJobCardReceiptResponseApiResponse } from "@/api/generated/apiClient";
import { getBaseUrl } from "../clientFactory";
import { normalizeError } from "./_errors";

// Create a client instance for public access (no auth headers in getFetch)
// However, the standard createClient uses getFetch() which has auth.
// We need a version that doesn't use auth headers.

const getPublicFetch = () => {
    return async (input: RequestInfo | URL, init?: RequestInit): Promise<Response> => {
        const response = await fetch(input, init);
        if (!response.ok) {
            throw response;
        }
        return response;
    };
};

const publicClient = new Client(getBaseUrl(), { fetch: getPublicFetch() });

export const publicReceiptRepo = {
  async get(jobCardId: string, token?: string): Promise<PublicJobCardReceiptResponseApiResponse> {
    try {
      return await publicClient.jobcardsGET4(jobCardId, token);
    } catch (error) {
      throw normalizeError(error);
    }
  },

  openPrint(jobCardId: string, token?: string): void {
    let url = `${getBaseUrl()}/public/receipt/jobcards/${jobCardId}/print`;
    if (token) {
        url += `?t=${encodeURIComponent(token)}`;
    }
    window.open(url, "_blank");
  },
};
