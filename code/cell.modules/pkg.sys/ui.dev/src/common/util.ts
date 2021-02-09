import { style } from './libs';
import * as t from './types';

export * from './util.Select';

/**
 * Common value formatting.
 */
export const Format = {
  /**
   * Convert a margin into a [top, right, bottom left] array.
   */
  toEdges: (input: t.EdgeSpacing) => style.toEdges(input),
};

/**
 * Helpers for working with events.
 */
export const Events = {
  isActionEvent(e: t.Event) {
    return e.type.startsWith('dev:actions/') || e.type.startsWith('dev:action/');
  },
};
