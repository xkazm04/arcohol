/**
 * Class Name Utilities for ArcPay React SDK
 *
 * Provides utilities for merging class names and handling
 * the classNames prop pattern for component customization.
 */

type ClassValue =
  | string
  | number
  | boolean
  | undefined
  | null
  | ClassValue[]
  | Record<string, boolean | undefined | null>;

/**
 * Merge multiple class values into a single string
 *
 * @example
 * cn('base', condition && 'conditional', 'always')
 * cn('base', { active: isActive, disabled: isDisabled })
 * cn(['array', 'of', 'classes'])
 */
export function cn(...inputs: ClassValue[]): string {
  const classes: string[] = [];

  for (const input of inputs) {
    if (!input) continue;

    if (typeof input === 'string' || typeof input === 'number') {
      classes.push(String(input));
    } else if (Array.isArray(input)) {
      const nested = cn(...input);
      if (nested) classes.push(nested);
    } else if (typeof input === 'object') {
      for (const [key, value] of Object.entries(input)) {
        if (value) classes.push(key);
      }
    }
  }

  return classes.join(' ');
}

/**
 * Strategy for merging user classNames with default classNames
 */
export type ClassNameStrategy = 'merge' | 'replace';

/**
 * Merge default class with user class based on strategy
 */
export function mergeClassName(
  defaultClass: string,
  userClass: string | undefined,
  strategy: ClassNameStrategy = 'merge'
): string {
  if (!userClass) return defaultClass;
  if (strategy === 'replace') return userClass;
  return cn(defaultClass, userClass);
}

/**
 * Generic classNames type for component slots
 */
export type SlotClassNames<T extends string> = Partial<Record<T, string>>;

/**
 * Merge slot classNames with defaults
 */
export function mergeSlotClassNames<T extends string>(
  defaults: Record<T, string>,
  overrides: SlotClassNames<T> | undefined,
  strategy: ClassNameStrategy = 'merge'
): Record<T, string> {
  if (!overrides) return defaults;

  const result = { ...defaults };
  for (const key of Object.keys(overrides) as T[]) {
    const override = overrides[key];
    if (override !== undefined) {
      result[key] = mergeClassName(defaults[key], override, strategy);
    }
  }
  return result;
}

/**
 * Create a classNames object from a base prefix
 * Useful for generating BEM-style classNames
 */
export function createSlotClassNames<T extends readonly string[]>(
  base: string,
  slots: T
): Record<T[number], string> {
  const result = {} as Record<T[number], string>;
  for (const slot of slots) {
    result[slot as T[number]] = slot === 'root' ? base : `${base}__${slot}`;
  }
  return result;
}
