/**
 * Testing utility types
 */

export interface MockBehavior<T> {
  /** Value to return */
  returns?: T;
  /** Error to throw */
  throws?: Error;
  /** Delay in ms before responding */
  delay?: number;
  /** Sequence of values to return on successive calls */
  sequence?: T[];
}

export interface CallRecord {
  method: string;
  args: unknown[];
  timestamp: Date;
  result?: unknown;
  error?: Error;
}

export interface MockResourceConfig {
  defaultDelay?: number;
  recordCalls?: boolean;
}

export interface MockServerConfig extends MockResourceConfig {
  /** Enable simulation mode (auto-respond with realistic data) */
  simulationMode?: boolean;
  /** Seed for reproducible random data */
  seed?: number;
}

export interface FixtureOptions {
  /** Seed for reproducible random data */
  seed?: number;
  /** Override specific fields */
  overrides?: Record<string, unknown>;
}

export interface MockWebhookRequest {
  body: string;
  headers: Record<string, string>;
}

export interface MockExpressRequest {
  body: Buffer | string;
  headers: Record<string, string>;
  method: string;
  path: string;
}

export interface MockExpressResponse {
  status: (code: number) => MockExpressResponse;
  json: (data: unknown) => void;
  send: (data: unknown) => void;
  statusCode?: number;
  _data?: unknown;
}
