import { t } from '../common';
import { prepare } from './util';

type N = t.ITreeviewNode;

/**
 * Strategy for the selection of nodes.
 */
export const selection: t.TreeviewStrategySelection = (ctx, disposable) => {
  return {
    listen(event$, until$) {
      const { api, events, mutate } = prepare({ ctx, disposable, event$, until$ });

      /**
       * EVENTS: Left mouse button.
       */
      const left = events.mouse('LEFT');

      /**
       * BEHAVIOR: Set as selected when node is single-clicked.
       */
      left.down.node$.subscribe((e) => mutate.selected(e.id));

      return api;
    },
  };
};
