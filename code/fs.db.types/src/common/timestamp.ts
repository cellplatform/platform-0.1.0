import * as t from '../types';

/**
 * Helpers for working with timestamps.
 */
export const timestamp = {
  /**
   * The current UTC timestamp.
   */
  get now() {
    return new Date().getTime();
  },

  /**
   * Ensures timestamps that may be on a model are present and represent actual dates.
   */
  ensure<T = any>(model: T, defaultTimestamp?: number): T {
    const asTimestamp = (key?: keyof t.IDbTimestamps) => {
      if (key && typeof model === 'object' && typeof model[key] === 'number') {
        if (model[key] === -1) {
          model = {
            ...model,
            [key]: defaultTimestamp === undefined ? timestamp.now : defaultTimestamp,
          };
        }
      }
    };
    if (model !== null && typeof model === 'object') {
      asTimestamp('createdAt');
      asTimestamp('modifiedAt');
    }
    return model as T;
  },

  /**
   * Sets the `modifiedAt` timestamp to now.
   */
  increment<T = any>(model: T, defaultTimestamp?: number) {
    if (model !== null) {
      model = timestamp.ensure(model, defaultTimestamp);
      if (typeof model === 'object' && typeof (model as any).modifiedAt === 'number') {
        const modifiedAt = timestamp.now;
        model = { ...model, modifiedAt };
      }
    }
    return model;
  },
};
