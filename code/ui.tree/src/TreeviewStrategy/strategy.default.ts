import { navigation } from './strategy.navigation';
import { selection } from './strategy.selection';
import * as t from './types';
import { prepare } from './util';

/**
 * All strategies configured for a typical tree-view usage scenario.
 */
export const all: t.TreeviewStrategyDefault = (ctx, disposable) => {
  return {
    listen(event$, until$) {
      const { api } = prepare({ ctx, disposable, event$, until$ });

      navigation(ctx, api).listen(event$, until$);
      selection(ctx, api).listen(event$, until$);

      return api;
    },
  };
};
