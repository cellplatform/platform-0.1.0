import * as t from './types';

import { navigation } from './strategy.navigation';
import { selection } from './strategy.selection';
import { all } from './strategy.default';

export const TreeviewStrategy: t.ITreeviewStrategies = {
  default: all,
  navigation,
  selection,
};
