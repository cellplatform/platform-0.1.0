import * as t from '../types';

/**
 * React hook.
 */
export type UseResizeObserver = {
  ready: boolean;
  root: t.ResizeObserver;
  rect: t.DomRect;
};
