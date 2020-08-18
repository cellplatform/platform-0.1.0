import { id } from '@platform/util.value';
import { enablePatches, isDraft, original, produceWithPatches, setAutoFreeze } from 'immer';
import { Observable, Subject } from 'rxjs';
import { filter, map, share, takeUntil } from 'rxjs/operators';

import { is, t } from '../common';
import { Patch } from '../Patch';
import * as action from './StateObject.action';
import * as events from './StateObject.events';
import * as merge from './StateObject.merge';

if (typeof setAutoFreeze === 'function') {
  setAutoFreeze(false);
}
if (typeof enablePatches === 'function') {
  enablePatches();
}

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

  public static dispatchable<T extends O, E extends t.Event<any> = any>(
    obj: t.IStateObjectWritable<T, E>,
  ): t.IStateObjectDispatchable<T, E> {
    return obj as t.IStateObjectDispatchable<T, E>;
  }

  /**
   * Merge multiple state-objects together to produce a single
   * synchronized state.
   */
  public static merge = merge.create(StateObject.create);

  /**
   * Convert a draft (proxied instance) object into a simple object.
   *
   * See: https://immerjs.github.io/immer/docs/original
   */
  public static toObject<T extends O>(input: T) {
    return isDraft(input) ? (original(input) as T) : input;
  }

  /**
   * Determine if the given value is a [StateObject].
   */
  public static isStateObject(input: any) {
    return is.stateObject(input);
  }

  /**
   * [Lifecycle]
   */
  private constructor(args: { initial: T }) {
    this._state = { ...args.initial };
    this.original = this.state;
  }

  public dispose() {
    if (!this.isDisposed) {
      this.fire({
        type: 'StateObject/disposed',
        payload: { original: this.original, final: this.state },
      });
      this._dispose$.next();
      this._dispose$.complete();
    }
  }

  /**
   * [Fields]
   */
  private _state: T;

  private _dispose$ = new Subject<void>();
  public readonly dispose$ = this._dispose$.pipe(share());

  private readonly _event$ = new Subject<t.StateObjectEvent>();
  public readonly event = events.create<T, E>(this._event$, this._dispose$);

  public readonly original: T;

  /**
   * [Properties]
   */
  public get isDisposed() {
    return this._dispose$.isStopped;
  }

  public get state() {
    return this._state;
  }

  public get readonly() {
    return this as t.IStateObject<T, E>;
  }

  public get dispatchable() {
    return this as t.IStateObjectDispatchable<T, E>;
  }

  /**
   * [Methods]
   */
  public change: t.StateObjectChange<T, E> = (fn, options = {}) => {
    const cid = id.cuid(); // "change-id"
    const type = (options.action || '').trim();

    const from = this.state;
    const { to, op, patches } = next(from, fn);
    if (Patch.isEmpty(patches)) {
      return { op, cid, patches };
    }

    // Fire BEFORE event.
    const changing: t.IStateObjectChanging<T, E> = {
      op,
      cid,
      from,
      to,
      patches,
      cancelled: false,
      cancel: () => (changing.cancelled = true),
      action: type,
    };

    this.fire({ type: 'StateObject/changing', payload: changing });

    // Update state and alert listeners.
    const cancelled = changing.cancelled ? changing : undefined;
    if (cancelled) {
      this.fire({ type: 'StateObject/cancelled', payload: cancelled });
    }

    const changed: t.IStateObjectChanged<T, E> | undefined = cancelled
      ? undefined
      : { op, cid, from, to, patches, action: type };

    if (changed) {
      this._state = to;
      this.fire({ type: 'StateObject/changed', payload: changed });
    }

    // Finish up.
    return {
      op,
      cid,
      changed,
      cancelled,
      patches,
    };
  };

  public dispatch = (event: E) => {
    return this.fire({ type: 'StateObject/dispatch', payload: { event } });
  };

  public dispatched = (action: E['payload'], takeUntil$?: Observable<any>) => {
    const ob$ = !takeUntil$
      ? this.event.dispatch$
      : this.event.dispatch$.pipe(takeUntil(takeUntil$));
    return ob$.pipe(
      filter((e) => e.type === action),
      map((e) => e.payload),
      share(),
    );
  };

  public action = (takeUntil$?: Observable<any>) => {
    return action.create<T, E>(this.event, takeUntil$);
  };

  /**
   * [Internal]
   */
  private fire = (e: t.StateObjectEvent) => this._event$.next(e);
}

/**
 * [Helpers]
 */

const next = <T extends O>(from: T, fn: t.StateObjectChanger<T> | T) => {
  if (typeof fn === 'function') {
    const [to, forward, backward] = produceWithPatches<T>(from, (draft) => {
      fn(draft as T);
      return undefined; // NB: No return value (to prevent replacement).
    });
    const patches = Patch.toPatchSet(forward, backward);
    const op: t.StateObjectChangeOperation = 'update';
    return { op, to, patches };
  } else {
    const [to, forward, backward] = produceWithPatches<T>(from, () => fn);
    const patches = Patch.toPatchSet(forward, backward);
    const op: t.StateObjectChangeOperation = 'replace';
    return { op, to, patches };
  }
};
