import * as strategy from './strategy';
import { keyboard } from './strategy.nav.keyboard';
import { mouse } from './strategy.nav.mouse';
import { selection } from './strategy.selection';
import * as t from './types';

export const TreeviewStrategy: t.ITreeviewStrategies = {
  merge: strategy.merge,
  default: strategy.defaultStrategy,
  selection,
  nav: { mouse, keyboard },
};
