import {
  formatAmount,
  parseAmount,
  formatCurrency,
  formatAddress,
  formatDate,
  formatRelativeTime,
} from '../utils/formatting';

describe('formatAmount', () => {
  it('should format whole numbers correctly', () => {
    expect(formatAmount('100')).toBe('100.00');
    expect(formatAmount('1000')).toBe('1,000.00');
    expect(formatAmount('1000000')).toBe('1,000,000.00');
  });

  it('should format decimal numbers correctly', () => {
    expect(formatAmount('100.5')).toBe('100.50');
    expect(formatAmount('100.12')).toBe('100.12');
    expect(formatAmount('100.123')).toBe('100.12');
  });

  it('should handle string and number inputs', () => {
    expect(formatAmount(100)).toBe('100.00');
    expect(formatAmount('100')).toBe('100.00');
  });

  it('should handle zero', () => {
    expect(formatAmount('0')).toBe('0.00');
    expect(formatAmount(0)).toBe('0.00');
  });

  it('should handle custom decimal places', () => {
    expect(formatAmount('100', 4)).toBe('100.0000');
    expect(formatAmount('100.12345', 4)).toBe('100.1235');
  });
});

describe('parseAmount', () => {
  it('should parse formatted amounts', () => {
    expect(parseAmount('1,000.00')).toBe('1000.00');
    expect(parseAmount('$1,000.00')).toBe('1000.00');
    expect(parseAmount('1,000,000.00')).toBe('1000000.00');
  });

  it('should handle plain numbers', () => {
    expect(parseAmount('100')).toBe('100');
    expect(parseAmount('100.50')).toBe('100.50');
  });
});

describe('formatCurrency', () => {
  it('should format USD amounts', () => {
    const result = formatCurrency('100', 'USD');
    expect(result).toContain('100');
    expect(result).toMatch(/\$|USD/);
  });

  it('should format EUR amounts', () => {
    const result = formatCurrency('100', 'EUR');
    expect(result).toContain('100');
  });
});

describe('formatAddress', () => {
  it('should truncate addresses correctly', () => {
    const address = '0x1234567890abcdef1234567890abcdef12345678';
    const formatted = formatAddress(address);
    expect(formatted).toBe('0x1234...5678');
  });

  it('should handle custom lengths', () => {
    const address = '0x1234567890abcdef1234567890abcdef12345678';
    const formatted = formatAddress(address, 8, 6);
    expect(formatted).toBe('0x123456...345678');
  });

  it('should return short addresses unchanged', () => {
    const address = '0x1234';
    const formatted = formatAddress(address);
    expect(formatted).toBe('0x1234');
  });
});

describe('formatDate', () => {
  it('should format dates correctly', () => {
    const date = new Date('2024-01-15T10:30:00Z');
    const formatted = formatDate(date);
    expect(formatted).toBeTruthy();
    expect(typeof formatted).toBe('string');
  });

  it('should handle string dates', () => {
    const formatted = formatDate('2024-01-15T10:30:00Z');
    expect(formatted).toBeTruthy();
  });
});

describe('formatRelativeTime', () => {
  it('should format recent times as just now', () => {
    const now = new Date();
    const formatted = formatRelativeTime(now);
    expect(formatted.toLowerCase()).toMatch(/just now|second/);
  });

  it('should format minutes ago', () => {
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
    const formatted = formatRelativeTime(fiveMinutesAgo);
    expect(formatted.toLowerCase()).toContain('minute');
  });

  it('should format hours ago', () => {
    const twoHoursAgo = new Date(Date.now() - 2 * 60 * 60 * 1000);
    const formatted = formatRelativeTime(twoHoursAgo);
    expect(formatted.toLowerCase()).toContain('hour');
  });
});
