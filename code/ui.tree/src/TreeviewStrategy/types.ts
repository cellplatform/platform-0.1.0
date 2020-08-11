import { Observable } from 'rxjs';
import { t } from '../common';

export type IStrategy<E extends t.Event, R extends D = D> = {
  listen(event$: Observable<E>, until?: Observable<any>): R;
};

/**
 * Mutation
 */
type M = ITreeviewStrategyMutation;
export type ITreeviewStrategyMutation = {
  current(id?: string): M;
  selected(id?: string): M;
  toggleOpen(id?: string): M;
};

/**
 * Strategy for treeview selection.
 */
type C = t.ITreeviewStrategyContext;
type D = t.IDisposable;
export type ITreeviewStrategy = IStrategy<t.TreeviewEvent>;
export type ITreeviewStrategyContext = { root: t.ITreeState };

export type TreeviewStrategyDefault = (ctx: C, disposable?: D) => ITreeviewStrategy;
export type TreeviewStrategyNavigation = (ctx: C, disposable?: D) => ITreeviewStrategy;
export type TreeviewStrategySelection = (ctx: C, disposable?: D) => ITreeviewStrategy;

export type ITreeviewStrategies = {
  default: TreeviewStrategyDefault;
  navigation: TreeviewStrategyNavigation;
  selection: TreeviewStrategySelection;
};
