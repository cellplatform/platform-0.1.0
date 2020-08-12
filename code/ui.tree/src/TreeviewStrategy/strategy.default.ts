import { keyboard } from './strategy.nav.keyboard';
import { mouse } from './strategy.nav.mouse';
import * as t from './types';

/**
 * All strategies configured for a typical tree-view usage scenario.
 */
export const all: t.TreeviewStrategyDefault = () => {
  const strategies = [mouse(), keyboard()];
  const strategy: t.ITreeviewStrategy = {
    next(e) {
      strategies.forEach((strategy) => strategy.next(e));
    },
  };
  return strategy;
};
