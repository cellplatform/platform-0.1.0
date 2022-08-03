import { t } from './common';

/**
 * Common value formatters.
 */
export const format: t.BuilderFormat = {
  string(input: any, options: { default?: string; trim?: boolean } = {}) {
    let value = typeof input === 'string' ? input : options.default;
    value = options.trim && typeof value === 'string' ? value.trim() : value;
    value = !value ? options.default : value;
    return value;
  },

  number(input: any, options: { min?: number; max?: number; default?: number } = {}) {
    let value = typeof input === 'number' ? input : options.default ?? undefined;
    if (typeof value === 'number') {
      value = options.min === undefined ? value : Math.max(options.min, value);
      value = options.max === undefined ? value : Math.min(options.max, value);
    }
    return value;
  },

  boolean(input: any, options: { default?: boolean } = {}) {
    const value = typeof input === 'boolean' ? input : options.default ?? undefined;
    return value;
  },
};
