/**
 * Base resource class for all API resources
 */

import type { ArcPayB2BConfig, PaginatedList, PaginationParams } from '../types';
import {
  ArcPayB2BError,
  AuthenticationError,
  NetworkError,
  TimeoutError,
  createErrorFromResponse,
} from '../utils/errors';
import { transformRequest, transformResponse, buildQueryString } from '../utils/transform';

export interface RequestOptions {
  method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  path: string;
  body?: unknown;
  query?: Record<string, unknown>;
  idempotencyKey?: string;
  timeout?: number;
}

const DEFAULT_BASE_URL = 'https://api.arcpay.io/v1/b2b';
const DEFAULT_TIMEOUT = 30000; // 30 seconds
const API_VERSION = '2024-01-01';

export abstract class BaseResource {
  protected readonly config: Required<ArcPayB2BConfig>;

  constructor(config: ArcPayB2BConfig) {
    this.config = {
      secretKey: config.secretKey,
      baseUrl: config.baseUrl || DEFAULT_BASE_URL,
      timeout: config.timeout || DEFAULT_TIMEOUT,
      apiVersion: config.apiVersion || API_VERSION,
      debug: config.debug || false,
    };
  }

  /**
   * Make an HTTP request to the API
   */
  protected async request<T>(options: RequestOptions): Promise<T> {
    const { method, path, body, query, idempotencyKey, timeout } = options;

    // Build URL
    let url = `${this.config.baseUrl}${path}`;
    if (query) {
      url += buildQueryString(query);
    }

    // Build headers
    const headers: Record<string, string> = {
      'Authorization': `Bearer ${this.config.secretKey}`,
      'Content-Type': 'application/json',
      'X-API-Version': this.config.apiVersion,
    };

    if (idempotencyKey) {
      headers['Idempotency-Key'] = idempotencyKey;
    }

    // Transform body
    const requestBody = body ? JSON.stringify(transformRequest(body)) : undefined;

    // Create abort controller for timeout
    const controller = new AbortController();
    const timeoutMs = timeout || this.config.timeout;
    const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

    try {
      if (this.config.debug) {
        console.log(`[ArcPay B2B] ${method} ${url}`);
        if (requestBody) {
          console.log(`[ArcPay B2B] Body: ${requestBody}`);
        }
      }

      const response = await fetch(url, {
        method,
        headers,
        body: requestBody,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      // Get request ID from response headers
      const requestId = response.headers.get('X-Request-Id') || undefined;

      // Parse response
      const responseText = await response.text();
      let responseData: unknown;

      try {
        responseData = responseText ? JSON.parse(responseText) : {};
      } catch {
        responseData = { message: responseText };
      }

      if (this.config.debug) {
        console.log(`[ArcPay B2B] Response (${response.status}):`, responseData);
      }

      // Handle errors
      if (!response.ok) {
        const errorBody = responseData as {
          code?: string;
          message?: string;
          details?: Record<string, unknown>;
        };

        throw createErrorFromResponse(response.status, errorBody, requestId);
      }

      // Transform and return response
      return transformResponse<T>(responseData);
    } catch (error) {
      clearTimeout(timeoutId);

      if (error instanceof ArcPayB2BError) {
        throw error;
      }

      if (error instanceof Error) {
        if (error.name === 'AbortError') {
          throw new TimeoutError(timeoutMs);
        }
        throw new NetworkError(error.message, error);
      }

      throw new NetworkError('An unknown error occurred');
    }
  }

  /**
   * Make a paginated list request
   */
  protected async listRequest<T>(
    path: string,
    params?: PaginationParams & Record<string, unknown>
  ): Promise<PaginatedList<T>> {
    const response = await this.request<{
      data: T[];
      hasMore: boolean;
      totalCount?: number;
      nextCursor?: string;
    }>({
      method: 'GET',
      path,
      query: params,
    });

    return {
      data: response.data,
      hasMore: response.hasMore,
      totalCount: response.totalCount,
      nextCursor: response.nextCursor,
    };
  }
}
