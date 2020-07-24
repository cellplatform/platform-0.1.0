import { id } from '@platform/util.value';
import { setAutoFreeze, enablePatches, produceWithPatches, Patch } from 'immer';
import { Subject, Observable } from 'rxjs';
import { filter, map, share, takeUntil } from 'rxjs/operators';
import * as events from './StateObject.events';

import { t } from '../common';

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
export class StateObject<T extends O, E extends t.Event<any>> implements t.IStateObjectWrite<T, E> {
  /**
   * Create a new [StateObject] instance.
   */
  public static create<T extends O, E extends t.Event<any> = any>(
    initial: T,
  ): t.IStateObjectWrite<T, E> {
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
    obj: t.IStateObjectWrite<T, E>,
  ): t.IStateObject<T, E> {
    return obj as t.IStateObject<T, E>;
  }

  public static dispatchable<T extends O, E extends t.Event<any> = any>(
    obj: t.IStateObjectWrite<T, E>,
  ): t.IStateObjectDispatchable<T, E> {
    return obj as t.IStateObjectDispatchable<T, E>;
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
  public change = (fn: t.StateObjectChanger<T> | T, action?: E['type']) => {
    const cid = id.cuid(); // "change-id"
    const type = (action || '').trim();

    const from = this.state;
    const { to, op, patches } = next(from, fn);

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

  public changed = (action: E['payload'], takeUntil$?: Observable<any>) => {
    const ob$ = !takeUntil$ ? this.event.$ : this.event.$.pipe(takeUntil(takeUntil$));
    return ob$.pipe(
      filter((e) => e.type === 'StateObject/changed'),
      map((e) => e.payload as t.IStateObjectChanged<T, E>),
      filter((e) => e.action === action),
      share(),
    );
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
const toPatch = (input: Patch): t.PatchOperation => ({ ...input, path: input.path.join('/') });
const toPatches = (input: Patch[]) => input.map((p) => toPatch(p));
const toPatchSet = (forward: Patch[], backward: Patch[]): t.StateObjectPatches => {
  return {
    prev: toPatches(backward),
    next: toPatches(forward),
  };
};

const next = <T extends O>(from: T, fn: t.StateObjectChanger<T> | T) => {
  if (typeof fn === 'function') {
    const [to, forward, backward] = produceWithPatches<T>(from, (draft) => {
      fn(draft as T);
      return undefined; // NB: No return value (to prevent replacement).
    });
    const patches = toPatchSet(forward, backward);
    const op: t.StateObjectChangeOperation = 'update';
    return { op, to, patches };
  } else {
    const [to, forward, backward] = produceWithPatches<T>(from, () => fn);
    const patches = toPatchSet(forward, backward);
    const op: t.StateObjectChangeOperation = 'replace';
    return { op, to, patches };
  }
};
