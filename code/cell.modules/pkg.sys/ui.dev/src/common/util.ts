import { style } from './libs';
import * as t from './types';

/**
 * Common value formatting.
 */
export const Format = {
  /**
   * Convert a margin into a [top, right, bottom left] array.
   */
  toEdges: (input: t.DevEdgeSpacing) => style.toEdges(input),
};

/**
 * Helpers for working with events.
 */
export const Events = {
  isActionEvent(e: t.Event) {
    return e.type.startsWith('dev:actions/') || e.type.startsWith('dev:action/');
  },
};
