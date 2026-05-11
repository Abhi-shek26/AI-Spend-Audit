/**
 * API request/response types
 */

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
}

export interface ApiErrorResponse {
  success: false;
  error: string;
  details?: Record<string, unknown>;
}
