import produce, { applyPatches, enablePatches } from 'immer';
import { Subject } from 'rxjs';
import { share } from 'rxjs/operators';

import * as t from './types';

enablePatches();

/**
 * A carrier of an immutable object which reports changes
 * via an observable.
 */
export class StateObject<T extends object> implements t.IStateObjectWritable<T> {
  public static create<T extends object>(initial: T): t.IStateObjectWritable<T> {
    return new StateObject<T>({ initial });
  }

  /**
   * [Lifecycle]
   */
  private constructor(args: { initial: T }) {
    this._state = { ...args.initial };
    this.original = this.state;
  }

  /**
   * [Fields]
   */
  private _state: T;
  private _event$ = new Subject<t.StateObjectEvent>();
  public readonly event$ = this._event$.pipe(share());
  public readonly original: T;

  /**
   * [Properties]
   */
  public get state() {
    return this._state;
  }

  /**
   * [Methods]
   */
  public change(fn: t.StateObjectChange<T>) {
    const patches: t.IStateObjectPatch[] = [];
    let state = produce<T>(
      this.state,
      (draft) => {
        fn(draft as T);
      },
      (p) => patches.push(...p),
    );
    this._state = state = applyPatches(state, patches);
    this._event$.next({
      type: 'StateObject/changed',
      payload: { state, patches },
    });
    return this;
  }
}
