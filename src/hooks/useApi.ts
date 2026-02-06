import { useMutation, useQuery, UseQueryOptions, UseMutationOptions } from '@tanstack/react-query';
import type { ApiError } from '@/api/http';

/**
 * Generic hook for API queries with proper typing
 */
export function useApiQuery<TData>(
  queryKey: string[],
  queryFn: () => Promise<TData>,
  options?: Omit<UseQueryOptions<TData, ApiError>, 'queryKey' | 'queryFn'>
) {
  return useQuery<TData, ApiError>({
    queryKey,
    queryFn,
    ...options,
  });
}

/**
 * Generic hook for API mutations with proper typing
 */
export function useApiMutation<TData, TVariables = void>(
  mutationFn: (variables: TVariables) => Promise<TData>,
  options?: Omit<UseMutationOptions<TData, ApiError, TVariables>, 'mutationFn'>
) {
  return useMutation<TData, ApiError, TVariables>({
    mutationFn,
    ...options,
  });
}
