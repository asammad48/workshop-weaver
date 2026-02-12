import { createClient } from './_repoBase';
import { Client } from '../generated/apiClient';
import type { 
  SupplierCreateRequest, 
  PartCreateRequest, 
  LocationCreateRequest,
  StockAdjustRequest 
} from '../generated/apiClient';

const client = createClient(Client);

export const inventoryRepo = {
  // Suppliers
  getSuppliers: (pageNumber?: number, pageSize?: number, search?: string) =>
    client.suppliersGET(pageNumber, pageSize, search),
  
  createSupplier: (data: SupplierCreateRequest) =>
    client.suppliersPOST(data),

  // Parts
  getParts: (pageNumber?: number, pageSize?: number, search?: string) =>
    client.partsGET(pageNumber, pageSize, search),

  getPart: (id: string) =>
    client.partsGET2(id),

  createPart: (data: PartCreateRequest) =>
    client.partsPOST(data),

  // Locations
  getLocations: (pageNumber?: number, pageSize?: number, search?: string) =>
    client.locationsGET(pageNumber, pageSize, search),

  createLocation: (data: LocationCreateRequest) =>
    client.locationsPOST(data),

  // Stock & Ledger
  getStock: (pageNumber?: number, pageSize?: number, search?: string, partId?: string, locationId?: string) =>
    client.stock(pageNumber, pageSize, search, undefined, undefined, partId, locationId),

  getLedger: (pageNumber?: number, pageSize?: number, search?: string) =>
    client.ledger(pageNumber, pageSize, search, undefined, undefined),

  adjustStock: (data: StockAdjustRequest) =>
    client.adjust(data),
};
