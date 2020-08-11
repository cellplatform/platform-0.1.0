import { keyboard } from './strategy.nav.keyboard';
import { mouse } from './strategy.nav.mouse';
import * as t from './types';
import * as util from './util';

/**
 * All strategies configured for a typical tree-view usage scenario.
 */
export const all: t.TreeviewStrategyDefault = (args) => {
  const { ctx, disposable, event$, until$ } = util.prepare(args);
  mouse({ ctx, event$, until$ });
  keyboard({ ctx, event$, until$ });
  return disposable;
};
