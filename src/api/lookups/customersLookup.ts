import { customersRepo } from '../repositories/customersRepo';
import { lookupsCache } from './lookupsCache';

/**
 * Loads customers into memory cache if not already loaded.
 * Returns the cached customers.
 */
export async function getCustomersOnce() {
  if (lookupsCache.customers.length > 0) {
    return lookupsCache.customers;
  }

  try {
    const response = await customersRepo.list(1, 1000); // Load all customers
    if (response.success && response.data?.items) {
      lookupsCache.customers = response.data.items.map(c => ({
        id: c.id!,
        name: c.fullName!,
        ...c
      }));
    }
    return lookupsCache.customers;
  } catch (error) {
    console.error('Failed to load customers lookup:', error);
    return [];
  }
}

/**
 * Get a map of customer ID to customer object for quick lookups
 */
export function getCustomerMap() {
  return Object.fromEntries(lookupsCache.customers.map(c => [c.id, c]));
}
