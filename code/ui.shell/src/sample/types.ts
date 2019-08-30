import * as t from '../types';
export * from '../types';

/**
 * Extension point of the context passed down through
 * the React hierarchy.
 */
export type IMyContext = t.IShellContext & {
  foo: string;
  bar: number;
};
