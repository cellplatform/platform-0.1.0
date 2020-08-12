import { keyboard } from './strategy.nav.keyboard';
import { mouse } from './strategy.nav.mouse';
import * as t from './types';
import * as util from './util';

/**
 * All strategies configured for a typical tree-view usage scenario.
 */
export const all: t.TreeviewStrategyDefault = (args) => {
  const { strategy, tree, treeview$, until$ } = util.args(args);

  mouse({ tree, treeview$, until$ });
  keyboard({ tree, treeview$, until$ });

  return strategy;
};
