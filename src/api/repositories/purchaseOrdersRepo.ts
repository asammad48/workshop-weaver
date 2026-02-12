import { createClient } from './_repoBase';
import { Client } from '../generated/apiClient';
import type { 
  PurchaseOrderCreateRequest, 
  PurchaseOrderReceiveRequest 
} from '../generated/apiClient';

const client = createClient(Client);

export const purchaseOrdersRepo = {
  getPurchaseOrders: (pageNumber?: number, pageSize?: number, search?: string) =>
    client.purchaseOrdersGET(pageNumber, pageSize, search),

  getPurchaseOrder: (id: string) =>
    client.purchaseOrdersGET2(id).then(res => {
      // If the API returns a response that matches the IPurchaseOrderResponse interface
      // but the NSwag class is missing properties we need, we might need to cast or 
      // the interface itself is more complete than the class.
      return res;
    }),

  createPurchaseOrder: (data: PurchaseOrderCreateRequest) =>
    client.purchaseOrdersPOST(data),

  submitPurchaseOrder: (id: string) =>
    client.submit(id),

  receivePurchaseOrder: (id: string, data: PurchaseOrderReceiveRequest) =>
    client.receive(id, data),
};
