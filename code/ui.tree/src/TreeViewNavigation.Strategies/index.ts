import { t } from '../common';
import { selection } from './strategy.selection';

export const strategies: t.TreeViewNavigationStrategies = {
  default: selection,
  selection,
};
