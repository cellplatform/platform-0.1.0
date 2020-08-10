import { Observable } from 'rxjs';
import { t } from '../common';

export type IStrategy<E extends t.Event> = {
  listen(event$: Observable<E>, until?: Observable<any>): t.IDisposable;
};

/**
 * Mutation
 */
type N = t.ITreeviewNode;
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
export type ITreeviewStrategy = IStrategy<t.TreeviewEvent>;
export type ITreeviewStrategyContext = { root: t.ITreeState };
export type ITreeviewStrategyConstructor = (
  ctx: C,
  disposable?: t.IDisposable,
) => ITreeviewStrategy;
