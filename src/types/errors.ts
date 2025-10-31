// Error types for API responses
export interface ApiErrorResponse {
  success: false;
  message: string;
  error?: {
    code: string;
    message: string;
    details?: Record<string, string[]>;
  };
  errors?: Record<string, string | string[]>;
  timestamp?: string;
}

export interface ApiError extends Error {
  code?: string;
  statusCode?: number;
  details?: Record<string, string[]>;
  originalError?: unknown;
}

export enum ErrorCode {
  // Authentication & Authorization
  UNAUTHORIZED = 'UNAUTHORIZED',
  FORBIDDEN = 'FORBIDDEN',
  TOKEN_EXPIRED = 'TOKEN_EXPIRED',
  INVALID_CREDENTIALS = 'INVALID_CREDENTIALS',

  // Validation
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  INVALID_INPUT = 'INVALID_INPUT',

  // Resource
  NOT_FOUND = 'NOT_FOUND',
  ALREADY_EXISTS = 'ALREADY_EXISTS',

  // Server
  INTERNAL_ERROR = 'INTERNAL_ERROR',
  SERVICE_UNAVAILABLE = 'SERVICE_UNAVAILABLE',

  // Network
  NETWORK_ERROR = 'NETWORK_ERROR',
  TIMEOUT = 'TIMEOUT',

  // Unknown
  UNKNOWN = 'UNKNOWN',
}

export interface ErrorMessage {
  title: string;
  description: string;
  action?: string;
}
