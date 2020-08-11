import { keyboard } from './strategy.nav.keyboard';
import { mouse } from './strategy.nav.mouse';
import * as t from './types';
import { prepare } from './util';

/**
 * All strategies configured for a typical tree-view usage scenario.
 */
export const all: t.TreeviewStrategyDefault = (ctx, disposable) => {
  return {
    listen(event$, until$) {
      const { api } = prepare({ ctx, disposable, event$, until$ });

      mouse(ctx, api).listen(event$, until$);
      keyboard(ctx, api).listen(event$, until$);

      return api;
    },
  };
};
