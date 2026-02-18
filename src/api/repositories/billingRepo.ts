import { Client } from "../generated/apiClient";
import { createClient } from "./_repoBase";
import { normalizeError } from "./_errors";

const client = createClient(Client);

export const billingRepo = {
  getInvoice: async (id: string) => {
    try {
      const response = await client.invoiceGET(id);
      return response.data;
    } catch (error) {
      throw normalizeError(error);
    }
  },
  createInvoice: async (id: string, data: any) => {
    try {
      const response = await client.invoicePOST(id, data);
      return response.data;
    } catch (error) {
      throw normalizeError(error);
    }
  },
  getPayments: async (invoiceId: string) => {
    try {
      const response = await client.paymentsGET(invoiceId);
      return response.data;
    } catch (error) {
      throw normalizeError(error);
    }
  },
  addPayment: async (invoiceId: string, data: any) => {
    try {
      const response = await client.paymentsPOST(invoiceId, data);
      return response.data;
    } catch (error) {
      throw normalizeError(error);
    }
  }
};
