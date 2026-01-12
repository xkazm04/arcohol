import type { MeterOption } from './types';

export const meterOptions: MeterOption[] = [
  { value: 'api_call', label: 'API Call', rate: 0.01, unit: 'call' },
  { value: 'data_export', label: 'Data Export', rate: 0.50, unit: 'GB' },
  { value: 'premium_feature', label: 'Premium Feature', rate: 5.00, unit: 'usage' },
  { value: 'storage_gb', label: 'Storage', rate: 0.10, unit: 'GB/mo' },
];
