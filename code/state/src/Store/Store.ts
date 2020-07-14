import { Subject, Observable } from 'rxjs';
import { filter, map, share, takeUntil } from 'rxjs/operators';
import produce from 'immer';

import * as t from './types';

export * from './types';

export type IStoreArgs<M extends Record<string, unknown>> = {
  initial: M;
  event$?: Subject<any>;
};

/**
 * An observable state machine.
 */
export class Store<M extends Record<string, unknown>, E extends t.IStoreEvent>
  implements t.IStore<M, E> {
  /**
   * [Static]
   */
  public static create<M extends Record<string, unknown>, E extends t.IStoreEvent>(
    args: IStoreArgs<M>,
  ) {
    return new Store<M, E>(args) as t.IStore<M, E>;
  }

  /**
   * [Lifecycle]
   */
  private constructor(args: IStoreArgs<M>) {
    this._.state = { ...args.initial };
    this._event$ = args.event$ || new Subject<E>();
    this.event$ = this._event$.pipe(
      takeUntil(this.dispose$),
      map((e) => this.toDispatchEvent(e)),
      share(),
    );
  }

  /**
   * Destroy the state machine.
   */
  public dispose() {
    this._dispose$.next();
    this._dispose$.complete();
  }

  /**
   * [Fields]
   */
  private readonly _dispose$ = new Subject<void>();
  private readonly _event$!: Subject<E>;
  private readonly _changing$ = new Subject<t.IStateChanging<M, E>>();
  private readonly _changed$ = new Subject<t.IStateChange<M, E>>();

  private readonly _ = {
    state: (undefined as unknown) as M,
  };

  /**
   * Fires when the state machine is disposed.
   */
  public readonly dispose$ = this._dispose$.pipe(share());

  /**
   * Fires immediately before the state changes.
   * Can be used to cancel updates.
   */
  public readonly changing$ = this._changing$.pipe(share());

  /**
   * Fires when the state has changed.
   */
  public readonly changed$ = this._changed$.pipe(share());

  /**
   * Fires when an event is dispatched.
   */
  public readonly event$!: Observable<t.IDispatch<M, E, E>>;

  /**
   * [Properties]
   */

  /**
   * Flag indicating if the state machine has been disposed.
   */
  public get isDisposed() {
    return this._dispose$.isStopped;
  }

  /**
   * The current state.
   */
  public get state() {
    return { ...this._.state };
  }

  /**
   * [Methods]
   */

  /**
   * Dispatches an event that may cause the state to change.
   */
  public dispatch(event: E) {
    this._event$.next(event);
    return this;
  }

  /**
   * Retrieves an observable narrowed in on a single type of dispatched event.
   */
  public on<E2 extends E>(type: E2['type']) {
    return this.event$.pipe(
      filter((e) => e.type === type),
      map((e) => e as t.IDispatch<M, E2, E>),
    );
  }

  /**
   * [Helpers]
   */

  private toDispatchEvent<E2 extends E>(event: E2) {
    const { type, payload } = event;
    const from = this.state;
    const result: t.IDispatch<M, E2, E> = {
      type,
      payload,
      get state() {
        return { ...from };
      },
      change: (next) => {
        const to =
          typeof next !== 'function'
            ? { ...next }
            : produce<M>(from, (draft) => {
                (next as any)(draft);
                return undefined; // NB: Important not to return value so as to use the draft modifications.
              });

        // Fire PRE event (and check if anyone cancelled it).
        let isCancelled = false;
        const change: t.IStateChange<M, E2> = { type, event, from, to };
        this._changing$.next({
          change,
          isCancelled,
          cancel: () => (isCancelled = true),
        });

        if (isCancelled) {
          return result;
        }

        // Update state.
        this._.state = to;
        this._changed$.next(change);
        return result;
      },
      dispatch: (event) => {
        this.dispatch(event);
        return result;
      },
    };

    return result;
  }
}

/**
 * Creates a new state machine.
 */
export function create<M extends Record<string, unknown>, E extends t.IStoreEvent>(
  args: IStoreArgs<M>,
) {
  return Store.create<M, E>(args);
}
