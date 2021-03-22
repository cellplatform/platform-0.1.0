import { style, value } from './libs';
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

  /**
   * Convert to a simple list of [Actions] objects.
   */
  async toActionsArray(input?: t.ActionsSet): Promise<t.Actions[]> {
    if (input === undefined) return [];

    type T = (t.Actions | t.ActionsImport)[];
    const list: T = Array.isArray(input) ? input : [input];

    return await Promise.all(
      list.map(async (item) => {
        return value.isPromise(item) ? (await item).default : item;
      }),
    );
  },
};

/**
 * Converts a
 */
export function asActionsArray(input?: t.Actions | t.Actions[]): t.Actions[] {
  return input === undefined ? [] : Array.isArray(input) ? input : [input];
}
