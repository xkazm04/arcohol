export interface Check {
  id: string;
  name: string;
  group: 'core' | 'network' | 'account';
  status: 'pass' | 'warn' | 'fail' | 'running' | 'pending';
  message: string;
  duration?: number;
}

export type OverallStatus = 'healthy' | 'degraded' | 'critical' | 'optimizing';
