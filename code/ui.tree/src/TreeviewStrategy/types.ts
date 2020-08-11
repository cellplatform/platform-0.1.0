import { t } from '../common';

type M = ITreeviewStrategyMutation;
type C = t.ITreeviewStrategyContext;
type D = t.IDisposable;

/**
 * Mutation
 */
export type ITreeviewStrategyMutation = {
  current(id?: string): M;
  selected(id?: string): M;
  toggleOpen(id?: string): M;
};

/**
 * Strategy for treeview selection.
 */
export type ITreeviewStrategy = t.IEventStrategy<t.TreeviewEvent>;
export type ITreeviewStrategyContext = { root: t.ITreeState };

export type TreeviewStrategyDefault = (ctx: C, disposable?: D) => ITreeviewStrategy;
export type TreeviewStrategyMouseNavigation = (ctx: C, disposable?: D) => ITreeviewStrategy;
export type TreeviewStrategyKeyboardNavigation = (ctx: C, disposable?: D) => ITreeviewStrategy;

export type ITreeviewStrategies = {
  default: TreeviewStrategyDefault;
  nav: {
    mouse: TreeviewStrategyMouseNavigation;
    keyboard: TreeviewStrategyKeyboardNavigation;
  };
};
