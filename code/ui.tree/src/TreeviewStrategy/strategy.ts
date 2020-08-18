import { keyboard } from './strategy.nav.keyboard';
import { mouse } from './strategy.nav.mouse';
import { selection } from './strategy.selection';
import * as t from './types';

/**
 * Merge multiple strategies together.
 */
export const merge: t.TreeviewStrategyMerge = (...strategies) => {
  return {
    next(e) {
      strategies.forEach((strategy) => strategy.next(e));
    },
  };
};

/**
 * All strategies configured for a typical tree-view usage scenario.
 */
export const all: t.TreeviewStrategyDefault = (args) => {
  return merge(mouse(args), keyboard(args), selection(args));
};
