import { Observable } from 'rxjs';

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
};

/**
 * Strategy for treeview selection.
 */
export type ITreeviewStrategy = D;

type A = TreeviewStrategyArgs;
export type TreeviewStrategyArgs = {
  tree: t.ITreeState;
  treeview$: Observable<E>;
  until$: Observable<any>;
};

export type TreeviewStrategyDefault = (args: A) => ITreeviewStrategy;
export type TreeviewStrategyMouseNavigation = (args: A) => ITreeviewStrategy;
export type TreeviewStrategyKeyboardNavigation = (args: A) => ITreeviewStrategy;

export type ITreeviewStrategies = {
  default: TreeviewStrategyDefault;
  nav: {
    mouse: TreeviewStrategyMouseNavigation;
    keyboard: TreeviewStrategyKeyboardNavigation;
  };
};
