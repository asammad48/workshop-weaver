import { getBaseUrl, getFetch } from '../clientFactory';

/**
 * Base configuration for NSwag-generated clients.
 * 
 * Repositories are the ONLY layer that should touch generated clients.
 * Pages and features should only interact with repository functions.
 */

export interface ClientConfig {
  baseUrl: string;
  fetch: typeof fetch;
}

/**
 * Create a configured instance of an NSwag-generated client
 * 
 * @example
 * // After NSwag generates the client:
 * import { AuthClient } from '@/api/generated/apiClient';
 * 
 * const authClient = createClient(AuthClient);
 * const result = await authClient.login(credentials);
 */
export function createClient<T>(
  ClientClass: new (baseUrl: string, http?: { fetch: typeof fetch }) => T
): T {
  return new ClientClass(getBaseUrl(), { fetch: getFetch() });
}

/**
 * Get configuration for manual client instantiation
 */
export function getClientConfig(): ClientConfig {
  return {
    baseUrl: getBaseUrl(),
    fetch: getFetch(),
  };
}
