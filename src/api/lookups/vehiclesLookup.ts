import { vehiclesRepo } from '../repositories/vehiclesRepo';
import { lookupsCache } from './lookupsCache';

/**
 * Loads vehicles into memory cache if not already loaded.
 * Returns the cached vehicles.
 */
export async function getVehiclesOnce() {
  if (lookupsCache.vehicles.length > 0) {
    return lookupsCache.vehicles;
  }

  try {
    const response = await vehiclesRepo.list(1, 1000); // Load all vehicles
    if (response.success && response.data?.items) {
      lookupsCache.vehicles = response.data.items.map(v => ({
        id: v.id!,
        name: `${v.plate} - ${v.make} ${v.model}`,
        ...v
      }));
    }
    return lookupsCache.vehicles;
  } catch (error) {
    console.error('Failed to load vehicles lookup:', error);
    return [];
  }
}

/**
 * Get a map of vehicle ID to vehicle object for quick lookups
 */
export function getVehicleMap() {
  return Object.fromEntries(lookupsCache.vehicles.map(v => [v.id, v]));
}
