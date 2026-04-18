import { Client, PublicJobCardReceiptResponseApiResponse } from "@/api/generated/apiClient";
import { getBaseUrl } from "../clientFactory";
import { normalizeError } from "./_errors";
import { useI18nStore } from "@/state/i18nStore";

// Create a client instance for public access (no auth headers in getFetch)
// However, the standard createClient uses getFetch() which has auth.
// We need a version that doesn't use auth headers.

const getPublicFetch = () => {
    return async (input: RequestInfo | URL, init?: RequestInit): Promise<Response> => {
        const language = useI18nStore.getState().language;
        const headers = new Headers(init?.headers);
        headers.set("Accept-Language", language);

        const response = await fetch(input, {
            ...init,
            headers,
        });
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

  async openPrint(jobCardId: string, token?: string): Promise<void> {
    let url = `${getBaseUrl()}/public/receipt/jobcards/${jobCardId}/print`;
    if (token) {
        url += `?t=${encodeURIComponent(token)}`;
    }
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
