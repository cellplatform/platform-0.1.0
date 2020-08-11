import { Observable } from 'rxjs';
import { t } from '../common';

type M = ITreeviewStrategyMutation;
type C = t.ITreeviewStrategyContext;
type D = t.IDisposable;

export type IStrategy<E extends t.Event, R extends D = D> = {
  listen(event$: Observable<E>, until?: Observable<any>): R;
};

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
export type ITreeviewStrategy = IStrategy<t.TreeviewEvent>;
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
