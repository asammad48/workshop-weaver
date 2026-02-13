import { Client, TransferResponsePageResponseApiResponse, TransferCreateRequest, TransferResponseApiResponse } from '../generated/apiClient';
import { createClient } from './_repoBase';

const client = createClient(Client);

export const transfersRepo = {
  getTransfers: (pageNumber: number = 1, pageSize: number = 10, search?: string) =>
    client.transfersGET(pageNumber, pageSize, search),

  createTransfer: (body: TransferCreateRequest) =>
    client.transfersPOST(body),

  requestTransfer: (id: string) =>
    client.request(id),

  shipTransfer: (id: string) =>
    client.ship(id),

  receiveTransfer: (id: string) =>
    client.receive2(id),
};
