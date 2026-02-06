import { getBaseUrl, getFetch } from '../clientFactory';

/**
 * Base configuration for NSwag-generated clients.
 * 
 * Repositories are the ONLY layer that should touch generated clients.
 * Pages and features should only interact with repository functions.
 */

export interface ClientConfig {
  baseUrl: string;
  http: { fetch: typeof fetch };
}

/**
 * Get configuration for NSwag client instantiation
 */
export function getClientConfig(): ClientConfig {
  return {
    baseUrl: getBaseUrl(),
    http: { fetch: getFetch() },
  };
}

/**
 * Create a configured instance of an NSwag-generated client
 * 
 * @example
 * import { Client } from '@/api/generated/apiClient';
 * 
 * const client = createClient(Client);
 * const result = await client.login({ email, password });
 */
export function createClient<T>(
  ClientClass: new (baseUrl?: string, http?: { fetch(url: RequestInfo, init?: RequestInit): Promise<Response> }) => T
): T {
  const config = getClientConfig();
  return new ClientClass(config.baseUrl, config.http);
}
