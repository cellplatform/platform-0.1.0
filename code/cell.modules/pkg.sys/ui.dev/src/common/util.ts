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
  toActionsArray(input?: t.ActionsSet) {
    type T = (t.Actions | t.ActionsImport)[];
    type R = {
      total: number;
      items: t.Actions[];
      load(): Promise<t.Actions[]>;
    };

    const items: T = input === undefined ? [] : Array.isArray(input) ? input : [input];

    const res: R = {
      total: items.length,
      items: [],
      async load() {
        res.items = await Promise.all(
          items.map(async (item) => {
            return value.isPromise(item) ? (await item).default : item;
          }),
        );
        return res.items;
      },
    };

    return res;
  },
};
