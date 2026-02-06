import { ApiException } from '@/api/generated/apiClient';

/**
 * Standardized API error structure for UI consumption
 */
export interface ApiError {
  status: number;
  message: string;
  details?: unknown;
}

/**
 * HTTP status code to user-friendly message mapping
 */
const STATUS_MESSAGES: Record<number, string> = {
  400: 'Invalid request. Please check your input.',
  401: 'Invalid credentials. Please try again.',
  403: 'You do not have permission to perform this action.',
  404: 'The requested resource was not found.',
  409: 'A conflict occurred. The resource may already exist.',
  422: 'Validation failed. Please check your input.',
  429: 'Too many requests. Please wait and try again.',
  500: 'An unexpected server error occurred.',
  502: 'Server is temporarily unavailable.',
  503: 'Service is temporarily unavailable.',
};

/**
 * Parse error response body for message
 */
function parseErrorBody(response: string): string | null {
  if (!response) return null;
  
  try {
    const parsed = JSON.parse(response);
    // Handle various API error formats
    return parsed.message || parsed.error || parsed.title || null;
  } catch {
    // If not JSON, check if it's a plain text message
    if (response.length < 200 && !response.includes('<')) {
      return response;
    }
    return null;
  }
}

/**
 * Normalize any error into a consistent ApiError structure
 */
export function normalizeError(error: unknown): ApiError {
  // NSwag ApiException
  if (ApiException.isApiException(error)) {
    const parsed = parseErrorBody(error.response);
    return {
      status: error.status,
      message: parsed || error.message || STATUS_MESSAGES[error.status] || 'An error occurred',
      details: error.result,
    };
  }

  // Already an ApiError shape
  if (typeof error === 'object' && error !== null) {
    const err = error as Record<string, unknown>;
    if (typeof err.status === 'number' && typeof err.message === 'string') {
      return {
        status: err.status,
        message: err.message,
        details: err.details,
      };
    }
  }

  // Standard Error
  if (error instanceof Error) {
    return {
      status: 500,
      message: error.message || 'An unexpected error occurred',
    };
  }

  // Fallback
  return {
    status: 500,
    message: 'An unexpected error occurred',
  };
}

/**
 * Get a user-friendly message from any error
 * Use this in UI components to display errors
 */
export function toUserMessage(error: unknown): string {
  const normalized = normalizeError(error);
  
  // For certain status codes, prefer the generic message if API message is technical
  if (normalized.status === 401 && normalized.message.toLowerCase().includes('unauthorized')) {
    return STATUS_MESSAGES[401];
  }
  
  return normalized.message;
}

/**
 * Check if an error is a specific HTTP status
 */
export function isStatus(error: unknown, status: number): boolean {
  const normalized = normalizeError(error);
  return normalized.status === status;
}

/**
 * Check if error is an authentication error (401)
 */
export function isAuthError(error: unknown): boolean {
  return isStatus(error, 401);
}

/**
 * Check if error is a validation error (400, 422)
 */
export function isValidationError(error: unknown): boolean {
  return isStatus(error, 400) || isStatus(error, 422);
}
