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


/**
 * Loads only fleet customers for dropdown use-cases (e.g. drivers).
 * Reuses cached customers when available so newly added/updated customers
 * (via cache updates) are reflected without forcing a reload.
 */
export async function getFleetCustomersOnce() {
  const cachedFleet = lookupsCache.customers.filter(c => c.customerType === 2 || c.customerType === 'Fleet');
  if (cachedFleet.length > 0) {
    return cachedFleet;
  }

  try {
    const response = await customersRepo.fleet(1, 1000);
    if (response.success && response.data?.items) {
      const fleetItems = response.data.items.map(c => ({
        id: c.id!,
        name: c.fullName!,
        ...c
      }));

      // Merge into shared customers cache so subsequent lookups stay warm.
      const existingIds = new Set(lookupsCache.customers.map(c => c.id));
      for (const item of fleetItems) {
        if (!existingIds.has(item.id)) {
          lookupsCache.customers.push(item);
        }
      }

      return fleetItems;
    }

    return [];
  } catch (error) {
    console.error('Failed to load fleet customers lookup:', error);
    return [];
  }
}
