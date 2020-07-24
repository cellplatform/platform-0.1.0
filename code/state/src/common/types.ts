export { Event, FireEvent } from '@platform/types';
export * from '../types';

export type Object = Record<string, unknown>;

/**
 * Inline copy of the `immer` Patch type.
 */
export type ArrayPatch = {
  op: 'replace' | 'remove' | 'add';
  path: (string | number)[];
  value?: any;
};
