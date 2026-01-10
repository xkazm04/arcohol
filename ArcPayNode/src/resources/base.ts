/**
 * Base resource class with HTTP client functionality
 */

import type { ArcPayConfig, PaginatedList, PaginationParams } from '../types';
import {
  ArcPayError,
  AuthenticationError,
  InvalidRequestError,
  NotFoundError,
  RateLimitError,
  NetworkError,
  TimeoutError,
} from '../utils/errors';

const DEFAULT_BASE_URL = 'https://api.arcpay.io/v1';
const DEFAULT_TIMEOUT = 30000;

export interface RequestOptions {
  method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  path: string;
  body?: unknown;
  query?: Record<string, string | number | boolean | undefined>;
  idempotencyKey?: string;
}

export class BaseResource {
  protected config: ArcPayConfig;
  protected baseUrl: string;
  protected timeout: number;

  constructor(config: ArcPayConfig) {
    this.config = config;
    this.baseUrl = config.baseUrl || DEFAULT_BASE_URL;
    this.timeout = config.timeout || DEFAULT_TIMEOUT;
  }

  /**
   * Make an HTTP request to the ArcPay API
   */
  protected async request<T>(options: RequestOptions): Promise<T> {
    const { method, path, body, query, idempotencyKey } = options;

    // Build URL with query parameters
    const url = new URL(`${this.baseUrl}${path}`);
    if (query) {
      for (const [key, value] of Object.entries(query)) {
        if (value !== undefined) {
          url.searchParams.set(key, String(value));
        }
      }
    }

    // Build headers
    const headers: Record<string, string> = {
      'Authorization': `Bearer ${this.config.secretKey}`,
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'User-Agent': '@arcpay/node',
    };

    if (this.config.apiVersion) {
      headers['ArcPay-Version'] = this.config.apiVersion;
    }

    if (idempotencyKey) {
      headers['Idempotency-Key'] = idempotencyKey;
    }

    // Create abort controller for timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.timeout);

    try {
      const response = await fetch(url.toString(), {
        method,
        headers,
        body: body ? JSON.stringify(body) : undefined,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      // Parse response
      const data = await this.parseResponse(response);

      // Handle errors
      if (!response.ok) {
        this.handleErrorResponse(response.status, data);
      }

      return data as T;
    } catch (error) {
      clearTimeout(timeoutId);

      if (error instanceof ArcPayError) {
        throw error;
      }

      if (error instanceof Error) {
        if (error.name === 'AbortError') {
          throw new TimeoutError();
        }
        throw new NetworkError(error.message);
      }

      throw new NetworkError('Unknown error occurred');
    }
  }

  /**
   * Parse response body
   */
  private async parseResponse(response: Response): Promise<unknown> {
    const contentType = response.headers.get('content-type');

    if (contentType?.includes('application/json')) {
      try {
        return await response.json();
      } catch {
        return null;
      }
    }

    return null;
  }

  /**
   * Handle error responses
   */
  private handleErrorResponse(status: number, data: unknown): never {
    const errorData = data as { error?: { code?: string; message?: string; details?: Record<string, unknown> } } | null;
    const error = errorData?.error;
    const message = error?.message || 'An error occurred';
    const code = error?.code || 'unknown_error';

    switch (status) {
      case 401:
        throw new AuthenticationError(message);
      case 400:
        throw new InvalidRequestError(message, error?.details);
      case 404:
        throw new NotFoundError('Resource', 'unknown');
      case 429:
        throw new RateLimitError();
      default:
        throw new ArcPayError(message, code, status, error?.details);
    }
  }

  /**
   * Helper for paginated list endpoints
   */
  protected async listRequest<T, P extends PaginationParams = PaginationParams>(
    path: string,
    params?: P
  ): Promise<PaginatedList<T>> {
    const query: Record<string, string | number | boolean | undefined> = {};

    if (params) {
      if (params.limit) query.limit = params.limit;
      if (params.startingAfter) query.starting_after = params.startingAfter;
      if (params.endingBefore) query.ending_before = params.endingBefore;

      // Add other params (for extended types like ListPaymentsParams)
      const paramsObj = params as Record<string, unknown>;
      for (const [key, value] of Object.entries(paramsObj)) {
        if (!['limit', 'startingAfter', 'endingBefore'].includes(key)) {
          if (value instanceof Date) {
            query[this.toSnakeCase(key)] = value.toISOString();
          } else if (value !== undefined && value !== null) {
            query[this.toSnakeCase(key)] = value as string | number | boolean;
          }
        }
      }
    }

    return this.request<PaginatedList<T>>({
      method: 'GET',
      path,
      query,
    });
  }

  /**
   * Convert camelCase to snake_case
   */
  protected toSnakeCase(str: string): string {
    return str.replace(/[A-Z]/g, (letter) => `_${letter.toLowerCase()}`);
  }

  /**
   * Convert snake_case to camelCase
   */
  protected toCamelCase(str: string): string {
    return str.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
  }

  /**
   * Transform object keys from snake_case to camelCase
   */
  protected transformResponse<T>(data: unknown): T {
    if (Array.isArray(data)) {
      return data.map((item) => this.transformResponse(item)) as T;
    }

    if (data !== null && typeof data === 'object') {
      const transformed: Record<string, unknown> = {};
      for (const [key, value] of Object.entries(data as Record<string, unknown>)) {
        const camelKey = this.toCamelCase(key);
        transformed[camelKey] = this.transformResponse(value);
      }
      return transformed as T;
    }

    return data as T;
  }

  /**
   * Transform object keys from camelCase to snake_case for API requests
   */
  protected transformRequest(data: unknown): unknown {
    if (Array.isArray(data)) {
      return data.map((item) => this.transformRequest(item));
    }

    if (data !== null && typeof data === 'object' && !(data instanceof Date)) {
      const transformed: Record<string, unknown> = {};
      for (const [key, value] of Object.entries(data as Record<string, unknown>)) {
        const snakeKey = this.toSnakeCase(key);
        if (value instanceof Date) {
          transformed[snakeKey] = value.toISOString();
        } else {
          transformed[snakeKey] = this.transformRequest(value);
        }
      }
      return transformed;
    }

    return data;
  }
}
