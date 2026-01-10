/**
 * Data transformation utilities
 * Handle conversion between camelCase (SDK) and snake_case (API)
 */

/**
 * Convert string from camelCase to snake_case
 */
export function toSnakeCase(str: string): string {
  return str.replace(/[A-Z]/g, (letter) => `_${letter.toLowerCase()}`);
}

/**
 * Convert string from snake_case to camelCase
 */
export function toCamelCase(str: string): string {
  return str.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
}

/**
 * Deep transform object keys from camelCase to snake_case
 */
export function transformRequest<T>(obj: T): unknown {
  if (obj === null || obj === undefined) {
    return obj;
  }

  if (obj instanceof Date) {
    return obj.toISOString();
  }

  if (Array.isArray(obj)) {
    return obj.map(transformRequest);
  }

  if (typeof obj === 'object') {
    const result: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(obj as Record<string, unknown>)) {
      result[toSnakeCase(key)] = transformRequest(value);
    }
    return result;
  }

  return obj;
}

/**
 * Deep transform object keys from snake_case to camelCase
 */
export function transformResponse<T>(obj: unknown): T {
  if (obj === null || obj === undefined) {
    return obj as T;
  }

  if (Array.isArray(obj)) {
    return obj.map(transformResponse) as T;
  }

  if (typeof obj === 'object') {
    const result: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(obj as Record<string, unknown>)) {
      const camelKey = toCamelCase(key);

      // Handle date fields
      if (
        (camelKey.endsWith('At') || camelKey.endsWith('Date')) &&
        typeof value === 'string'
      ) {
        result[camelKey] = new Date(value);
      } else {
        result[camelKey] = transformResponse(value);
      }
    }
    return result as T;
  }

  return obj as T;
}

/**
 * Build query string from params object
 */
export function buildQueryString(
  params: Record<string, unknown>
): string {
  const searchParams = new URLSearchParams();

  for (const [key, value] of Object.entries(params)) {
    if (value === undefined || value === null) {
      continue;
    }

    const snakeKey = toSnakeCase(key);

    if (value instanceof Date) {
      searchParams.append(snakeKey, value.toISOString());
    } else if (typeof value === 'object') {
      searchParams.append(snakeKey, JSON.stringify(value));
    } else {
      searchParams.append(snakeKey, String(value));
    }
  }

  const queryString = searchParams.toString();
  return queryString ? `?${queryString}` : '';
}

/**
 * Format amount for API (string with 2 decimal places)
 */
export function formatAmount(amount: number): string {
  return amount.toFixed(2);
}

/**
 * Parse amount from API response
 */
export function parseAmount(amount: string): number {
  return parseFloat(amount);
}
