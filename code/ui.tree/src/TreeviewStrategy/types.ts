import { t } from '../common';

type M = ITreeviewStrategyMutation;
type D = t.IDisposable;
type E = t.TreeviewEvent;

/**
 * Mutation.
 */
export type ITreeviewStrategyMutation = {
  current(id?: string): M;
  selected(id?: string): M;
  toggleOpen(id?: string): M;
  open(id?: string): M;
  close(id?: string): M;
};

/**
 * Strategy for treeview selection.
 */
export type ITreeviewStrategy = { next: TreeviewStrategyNext };
export type TreeviewStrategyNext = (args: TreeviewStrategyNextArgs) => void;
export type TreeviewStrategyNextArgs = { event: E; tree: t.ITreeState };
export type TreeviewStrategyMerge = (...strategies: t.ITreeviewStrategy[]) => ITreeviewStrategy;

export type TreeviewStrategyDefault = () => ITreeviewStrategy;
export type TreeviewStrategyMouseNavigation = () => ITreeviewStrategy;
export type TreeviewStrategyKeyboardNavigation = () => ITreeviewStrategy;

export type TreeviewStrategySelection = (args?: TreeviewStrategySelectionArgs) => ITreeviewStrategy;
export type TreeviewStrategySelectionArgs = { color?: string };

export type ITreeviewStrategies = {
  merge: TreeviewStrategyMerge;
  default: TreeviewStrategyDefault;
  selection: TreeviewStrategySelection;
  nav: {
    mouse: TreeviewStrategyKeyboardNavigation;
    keyboard: TreeviewStrategyKeyboardNavigation;
  };
};
