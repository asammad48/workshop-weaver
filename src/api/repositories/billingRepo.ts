import { Client } from "../generated/apiClient";
import { apiClient } from "../generated/apiClient"; // Assuming apiClient is an instance of Client exported elsewhere, but if it's missing, we need to fix it.

export const billingRepo = {
  getInvoice: async (id: string) => {
    const response = await apiClient.invoiceGET(id);
    return response.data;
  },
  createInvoice: async (id: string, data: any) => {
    const response = await apiClient.invoicePOST(id, data);
    return response.data;
  },
  getPayments: async (invoiceId: string) => {
    const response = await apiClient.paymentsGET(invoiceId);
    return response.data;
  },
  addPayment: async (invoiceId: string, data: any) => {
    const response = await apiClient.paymentsPOST(invoiceId, data);
    return response.data;
  }
};
