import { getBaseUrl } from "../clientFactory";

export const invoicesRepo = {
  openPrint(invoiceId: string): void {
    const url = `${getBaseUrl()}/api/v1/billing/invoices/${invoiceId}/print`;
    window.open(url, "_blank");
  },
};
