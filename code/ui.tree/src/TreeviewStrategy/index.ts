import * as t from './types';

import { all } from './strategy.default';
import { mouse } from './strategy.nav.mouse';
import { keyboard } from './strategy.nav.keyboard';

export const TreeviewStrategy: t.ITreeviewStrategies = {
  default: all,
  nav: { mouse, keyboard },
};
