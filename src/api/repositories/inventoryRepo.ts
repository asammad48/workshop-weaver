import { createClient } from './_repoBase';
import { Client } from '../generated/apiClient';
import type { 
  SupplierCreateRequest, 
  PartCreateRequest, 
  LocationCreateRequest 
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
};
