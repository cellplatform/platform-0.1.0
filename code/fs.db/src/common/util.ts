import { time } from './libs';
import * as t from '../types';

/**
 * Ensures timestamps that may be on a model are present and represent actual dates.
 *
 */
export function ensureTimestamps<T = any>(model: T, defaultTimestamp?: number): T {
  const asTimestamp = (key?: keyof t.IDocTimestamps) => {
    if (key && typeof model === 'object' && typeof model[key] === 'number') {
      if (model[key] === -1) {
        const timestamp = defaultTimestamp === undefined ? time.now.timestamp : defaultTimestamp;
        model = { ...model, [key]: timestamp };
      }
    }
  };
  if (model !== null && typeof model === 'object') {
    asTimestamp('createdAt');
    asTimestamp('modifiedAt');
  }
  return model as T;
}

/**
 * Sets the `modifiedAt` timestamp to now.
 */
export function incrementTimestamps<T = any>(model: T, defaultTimestamp?: number) {
  if (model !== null) {
    model = ensureTimestamps(model, defaultTimestamp);
    if (typeof model === 'object' && typeof (model as any).modifiedAt === 'number') {
      model = { ...model, modifiedAt: time.now.timestamp };
    }
  }
  return model;
}
