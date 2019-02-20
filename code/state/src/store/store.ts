import { Subject, Observable } from 'rxjs';
import { IData, StoreInternal, StoreContext } from '../common';
import { IState, IAction, StateChange, IActionEpic, IStore, Reducer, StoreFactory } from '../types';
import * as dispatcher from '../dispatcher';
import * as epic from '../epic';
import { add } from './store.add';
import { remove } from './store.remove';
import { dict } from './store.dict';
import { get } from './store.get';
import { getState } from './store.state';

let uid = 0;

/**
 * Creates a new store of state.
 */
export function createStore<S extends IState, A extends IAction>(
  initialState: S,
  options: {
    context?: any; // NB: Pass function to return context as a factory.
    name?: string;
  } = {},
): IStore<S, A> {
  const data: IData<S, A> = {
    reducers: [],
    children: [],
    childDictionaries: [],
    current: initialState,
    state$: new Subject<StateChange<S, A>>(),
    context: undefined,
  };

  uid++;
  const api: StoreInternal<S, A> = {
    uid,
    name: options.name,
    data, // Private (internal API).

    /**
     * The current state as an observable.
     */
    state$: data.state$.asObservable(),

    /**
     * The current state (deep).
     */
    get state() {
      return getState(api, {}) as S;
    },

    /**
     * The context object for additional helpers related to the store.
     */
    get context() {
      if (!data.context && options.context) {
        data.context = typeof options.context === 'function' ? options.context() : options.context;
      }
      return data.context;
    },

    /**
     * Dispatches a new action.
     */
    dispatch<T extends IAction>(type: T['type'], payload: T['payload'] = {}) {
      if (data.parent) {
        // Walk up to the root store to dispatch.
        data.parent.dispatch(type, payload);
      } else {
        // From the root, run all reducers in the hierarchy (bottom-up).
        const action: IAction = { type, payload };
        const context = api.context;
        const options: StoreContext = { context };
        dispatcher.runReducerHierarchy(api, action, options);
      }
      return api;
    },

    /**
     * Registers a reducer (called on all actions).
     */
    reducer<T extends A>(fn: Reducer<S, T>) {
      data.reducers = [...data.reducers, { reducer: fn }];
      return api;
    },

    /**
     * Registers a reducer for a specific action.
     */
    reduce<T extends A>(action: T['type'], fn: Reducer<S, T>) {
      data.reducers = [...data.reducers, { reducer: fn, actionType: action }];
      return api;
    },

    /**
     * Reacts to a specific action (use for business logic and async operations).
     */
    on<T extends A>(action: T['type'] | Array<T['type']>) {
      const result = epic.on(action, data.state$, api.dispatch);
      return result as Observable<IActionEpic<S, T>>;
    },

    /**
     * Adds a new child dictionary.
     */
    dict(key: string, factory: StoreFactory<IState, IAction>) {
      dict(api, key, factory);
      return api;
    },

    /**
     * Adds a child store.
     */
    add(key: string, store: IStore<IState, IAction>) {
      add(api, key, store);
      return api;
    },

    /**
     * Removes a child store.
     */
    remove(key: string, options?: { key?: string }) {
      remove(api, key, options);
      return api;
    },

    /**
     * Retrieves the child store at the specified key.
     * Key can contain periods to step deeply into the hierarchy.
     */
    get<S extends IState, A extends IAction>(
      path: string | undefined,
      options: { key?: string; initialState?: S } = {},
    ): IStore<S, A> | undefined {
      return get<S, A>(api, path, options);
    },
  };

  // Finish up.
  return api as IStore<S, A>;
}
