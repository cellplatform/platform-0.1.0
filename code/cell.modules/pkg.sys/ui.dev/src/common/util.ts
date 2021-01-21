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
