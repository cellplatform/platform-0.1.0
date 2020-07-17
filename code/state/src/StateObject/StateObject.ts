import { id } from '@platform/util.value';
import produce, { setAutoFreeze } from 'immer';
import { Subject } from 'rxjs';
import { filter, map, share } from 'rxjs/operators';

import { t } from '../common';

setAutoFreeze(false);

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
export class StateObject<T extends O, E extends t.Event<any>>
  implements t.IStateObjectWritable<T, E> {
  /**
   * Create a new [StateObject] instance.
   */
  public static create<T extends O, E extends t.Event<any> = any>(
    initial: T,
  ): t.IStateObjectWritable<T, E> {
    return new StateObject<T, E>({ initial });
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
  public static readonly<T extends O, E extends t.Event<any> = any>(
    obj: t.IStateObjectWritable<T, E>,
  ): t.IStateObject<T, E> {
    return obj as t.IStateObject<T, E>;
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
    map((e) => e.payload as t.IStateObjectChanged<T, E>),
    share(),
  );

  public readonly cancelled$ = this._event$.pipe(
    filter((e) => e.type === 'StateObject/cancelled'),
    map((e) => e.payload as t.IStateObjectCancelled<T>),
    share(),
  );

  public readonly dispatch$ = this._event$.pipe(
    filter((e) => e.type === 'StateObject/dispatch'),
    map((e) => (e.payload as t.IStateObjectDispatch<E>).event),
    share(),
  );

  public readonly original: T;

  /**
   * [Properties]
   */
  public get state() {
    return this._state;
  }

  public get readonly() {
    return this as t.IStateObject<T, E>;
  }

  /**
   * [Methods]
   */
  public change = (fn: t.StateObjectChanger<T> | T, action?: E['type']) => {
    const cid = id.shortid(); // "change-id"
    const from = this.state;
    const to = next(from, fn);
    const evenType = (action || '').trim();

    // Fire BEFORE event.
    const payload: t.IStateObjectChanging<T, E> = {
      cid,
      from,
      to,
      cancelled: false,
      cancel: () => (payload.cancelled = true),
      action: evenType,
    };
    this.fire({ type: 'StateObject/changing', payload });

    // Update state.
    const cancelled = payload.cancelled;
    if (cancelled) {
      this.fire({ type: 'StateObject/cancelled', payload });
    } else {
      this._state = to;
      this.fire({
        type: 'StateObject/changed',
        payload: { cid, from, to, action: evenType },
      });
    }

    // Finish up.
    return { cid, from, to, cancelled };
  };

  public dispatch = (event: E) => {
    return this.fire({ type: 'StateObject/dispatch', payload: { event } });
  };

  /**
   * [Internal]
   */
  private fire(e: t.StateObjectEvent) {
    this._event$.next(e);
  }
}

/**
 * [Helpers]
 */

const next = <T extends O>(from: T, fn: t.StateObjectChanger<T> | T) => {
  if (typeof fn === 'function') {
    // Update.
    return produce<T>(from, (draft) => {
      fn(draft as T);
      return undefined; // NB: No return value, to prevent replacement.
    });
  } else {
    // Replace.
    return produce<T>(from, () => fn);
  }
};
