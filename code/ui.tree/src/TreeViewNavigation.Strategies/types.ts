import * as t from '../common/types';

type Strategy = t.TreeViewNavigationStrategy;

export type TreeViewNavigationStrategy = (state: t.ITreeViewNavigation) => void;
export type ITreeViewNavigationChanged = t.IStateObjectChanged<t.ITreeViewNavigationState>;

export type TreeViewNavigationStrategies = {
  default: Strategy;
  selection: Strategy;
};
