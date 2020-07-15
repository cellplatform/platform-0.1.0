import produce from 'immer';
import { Subject } from 'rxjs';
import { share, filter, map } from 'rxjs/operators';
import { id } from '@platform/util.value';

import * as t from './types';

type O = Record<string, unknown>;

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
export class StateObject<T extends O> implements t.IStateObjectWritable<T> {
  /**
   * Create a new [StateObject] instance.
   */
  public static create<T extends O>(initial: T): t.IStateObjectWritable<T> {
    return new StateObject<T>({ initial });
  }

  /**
   * Convert a writeable [StateObject] to a readon-only version.

   * NOTE:
   *    This is useful when wishing to be principled and constrain
   *    updates to the object to centralised behavioral logic 
   *    (analagous to "reducers" say) and not propogate update
   *    logic around an application.
   * 
   */
  public static readonly<T extends O>(obj: t.IStateObjectWritable<T>): t.IStateObject<T> {
    return obj as t.IStateObject<T>;
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
  private readonly _event$ = new Subject<t.StateObjectEvent>();
  public readonly event$ = this._event$.pipe(share());

  public readonly changing$ = this._event$.pipe(
    filter((e) => e.type === 'StateObject/changing'),
    map((e) => e.payload as t.IStateObjectChanging<T>),
    share(),
  );

  public readonly changed$ = this._event$.pipe(
    filter((e) => e.type === 'StateObject/changed'),
    map((e) => e.payload as t.IStateObjectChanged<T>),
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
  public change(fn: t.StateObjectChanger<T>) {
    const cid = id.shortid(); // "change-id"
    const from = this.state;

    // Invoke the change handler.
    const to = produce<T>(from, (draft) => {
      fn(draft as T);
    });

    // Fire BEFORE event.
    const payload: t.IStateObjectChanging<T> = {
      cid,
      from,
      to,
      cancelled: false,
      cancel: () => (payload.cancelled = true),
    };
    this.fire({ type: 'StateObject/changing', payload });

    // Update state.
    const cancelled = payload.cancelled;
    if (!cancelled) {
      this._state = to;
      this.fire({ type: 'StateObject/changed', payload: { cid, from, to } });
    }

    // Finish up.
    return { cid, from, to, cancelled };
  }

  /**
   * Helpers
   */
  private fire(e: t.StateObjectEvent) {
    this._event$.next(e);
  }
}
