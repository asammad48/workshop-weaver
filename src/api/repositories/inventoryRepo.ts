import { createClient } from './_repoBase';
import { Client } from '../generated/apiClient';
import type { 
  SupplierCreateRequest, 
  PartCreateRequest, 
  LocationCreateRequest,
  StockAdjustRequest 
} from '../generated/apiClient';
import { updateLookupCache } from '../lookups/lookupsCache';

const client = createClient(Client);

export const inventoryRepo = {
  // Suppliers
  getSuppliers: (pageNumber?: number, pageSize?: number, search?: string) =>
    client.suppliersGET(pageNumber, pageSize, search),
  
  createSupplier: async (data: SupplierCreateRequest) => {
    const res = await client.suppliersPOST(data);
    if (res.success && res.data) {
      updateLookupCache('suppliers', res.data);
    }
    return res;
  },

  // Parts
  getParts: (pageNumber?: number, pageSize?: number, search?: string) =>
    client.partsGET(pageNumber, pageSize, search),

  getPart: (id: string) =>
    client.partsGET2(id),

  createPart: async (data: PartCreateRequest) => {
    const res = await client.partsPOST(data);
    if (res.success && res.data) {
      updateLookupCache('parts', res.data);
    }
    return res;
  },

  // Locations
  getLocations: (pageNumber?: number, pageSize?: number, search?: string) =>
    client.locationsGET(pageNumber, pageSize, search),

  createLocation: async (data: LocationCreateRequest) => {
    const res = await client.locationsPOST(data);
    if (res.success && res.data) {
      updateLookupCache('locations', res.data);
    }
    return res;
  },

  // Stock & Ledger
  getStock: (pageNumber?: number, pageSize?: number, search?: string, partId?: string, locationId?: string) =>
    client.stock(pageNumber, pageSize, search, undefined, undefined, partId, locationId),

  getLedger: (pageNumber?: number, pageSize?: number, search?: string) =>
    client.ledger(pageNumber, pageSize, search, undefined, undefined),

  adjustStock: (data: StockAdjustRequest) =>
    client.adjust(data),
};
