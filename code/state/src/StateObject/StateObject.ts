import produce from 'immer';
import { Subject } from 'rxjs';
import { share, filter, map } from 'rxjs/operators';

import * as t from './types';

/**
 * A lightweight carrier of an immutable object which reports changes
 * via an observable.
 *
 * To change the state use the `change` method on the [IStateObjectWritable]
 * interface of the object.
 *
 * To pass an read-only version of the [StateObject] around an application
 * use the plain [IStateObject] interface which does not expose the `change` method.
 */
export class StateObject<T extends Record<string, unknown>> implements t.IStateObjectWritable<T> {
  public static create<T extends Record<string, unknown>>(initial: T): t.IStateObjectWritable<T> {
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
  public readonly changed$ = this._event$.pipe(
    filter((e) => e.type === 'StateObject/changed'),
    map((e) => e.payload),
    share(),
  );
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
    const from = this.state;
    const to = produce<T>(from, (draft) => {
      fn(draft as T);
    });
    this._state = to;
    this._event$.next({
      type: 'StateObject/changed',
      payload: { from, to },
    });
    return this;
  }
}
