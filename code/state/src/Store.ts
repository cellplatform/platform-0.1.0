import { Subject } from 'rxjs';
import { map, share, takeUntil, filter } from 'rxjs/operators';
import * as t from './types';

export * from './types';

export type IStoreArgs<M extends {}> = {
  initial: M;
};

/**
 * Creates a new state machine.
 */
export function create<M extends {}, E extends t.IStoreEvent>(args: IStoreArgs<M>) {
  return Store.create<M, E>(args);
}

/**
 * An observable state machine.
 */
export class Store<M extends {}, E extends t.IStoreEvent> {
  /**
   * [Static]
   */
  public static create<M extends {}, E extends t.IStoreEvent>(args: IStoreArgs<M>) {
    return new Store<M, E>(args);
  }

  /**
   * [Lifecycle]
   */
  private constructor(args: IStoreArgs<M>) {
    this._.state = { ...args.initial };
  }

  /**
   * Destroy the state machine.
   */
  public dispose() {
    this._.dispose$.next();
    this._.dispose$.complete();
  }

  /**
   * [Fields]
   */
  private readonly _ = {
    dispose$: new Subject(),
    events$: new Subject<E>(),
    changing$: new Subject<t.IStateChanging<M>>(),
    changed$: new Subject<t.IStateChange<M>>(),
    state: (undefined as unknown) as M,
  };

  /**
   * Fires when the state machine is disposed.
   */
  public readonly dispose$ = this._.dispose$.pipe(share());

  /**
   * Fires immediately before the state changes.
   * Can be used to cancel updates.
   */
  public readonly changing$ = this._.changing$.pipe(share());

  /**
   * Fires when the state has changed.
   */
  public readonly changed$ = this._.changed$.pipe(share());

  /**
   * Fires when an event is dispatched.
   */
  public readonly events$ = this._.events$.pipe(
    takeUntil(this.dispose$),
    map(e => this.toDispatchEvent(e)),
    share(),
  );

  /**
   * [Properties]
   */

  /**
   * Flag indicating if the state machine has been disposed.
   */
  public get isDisposed() {
    return this._.dispose$.isStopped;
  }

  /**
   * The current state.
   */
  public get state() {
    return this._.state;
  }

  /**
   * [Methods]
   */

  /**
   * Dispatches an event that may cause the state to change.
   */
  public dispatch(event: E) {
    this._.events$.next(event);
    return this;
  }

  /**
   * Retrieves an observable narrowed in on a single type of dispatched event.
   */
  public on<T extends E>(type: T['type']) {
    return this.events$.pipe(
      filter(e => e.type === type),
      map(e => e as t.IDispatch<M, T, E>),
    );
  }

  /**
   * [Helpers]
   */

  private toDispatchEvent<T extends E>(event: T) {
    const { type, payload } = event;
    let current: M | undefined;
    const getCurrent = () => (current = current || { ...this.state });
    const result: t.IDispatch<M, T, E> = {
      type,
      payload,
      get state() {
        return getCurrent();
      },
      change: next => {
        const from = getCurrent();
        const to = { ...next };

        // Fire PRE event (and check if anyone cancelled it).
        let isCancelled = false;
        const change: t.IStateChange<M, T> = { type, event, from, to };
        this._.changing$.next({
          change,
          isCancelled,
          cancel: () => (isCancelled = true),
        });
        if (isCancelled) {
          return result;
        }

        // Update state.
        this._.state = to;
        this._.changed$.next(change);
        return result;
      },
      dispatch: event => {
        this.dispatch(event);
        return result;
      },
    };
    return result;
  }
}
