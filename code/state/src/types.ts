import { Observable } from 'rxjs';

/**
 * Defines a state tree.
 */
export type IState = {
  [key: string]: any;
};

/**
 * Defines an action that is dispatched to updated the state tree.
 */
export interface IAction {
  type: string;
  payload: { [key: string]: any };
}

/**
 * Generic definition of a function that creates and fires an action.
 */
export type IDispatcher<A extends IAction> = (
  store: IStore<any, any>,
  payload: A['payload'],
) => void;

/**
 * A function that changes a state-tree based on an action.
 */
export type Reducer<TState extends IState, TAction extends IAction> = (
  state: TState,
  action: TAction,
  options?: StoreContext,
) => TState | void;

/**
 * An object passed to reducers and epics providing context.
 */
export type StoreContext = {
  context?: any;
  name?: string; // The optional display name of the store (passed into `createStore`).
  key?: string; // The key of the store if within a dictionary.
};

/**
 * An event fired from an obervable when the state tree changes.
 */
export type StateChange<TState extends IState, TAction extends IAction> = {
  type: TAction['type'];
  state: TState;
  action: TAction;
  payload: TAction['payload'];
  options: StoreContext;
};

/**
 * An state change event that is passed to an "epic".
 */
export interface IActionEpic<S extends IState, A extends IAction> extends StateChange<S, A> {
  dispatch: <T extends IAction>(type: T['type'], payload?: T['payload']) => void;
}

/**
 * A store containing state and the necessary methods for
 * changing and responding to state-change actions.
 */
export interface IStore<S extends IState, A extends IAction> {
  readonly uid: string | number;
  readonly name?: string;
  readonly state$: Observable<StateChange<S, A>>;
  readonly state: S;
  readonly context?: any;

  dispatch: <T extends IAction>(type: T['type'], payload?: T['payload']) => IStore<S, A>;

  reducer: <T extends A>(fn: Reducer<S, T>) => IStore<S, A>;
  reduce: <T extends A>(action: T['type'], fn: Reducer<S, T>) => IStore<S, A>;

  on: <T extends A>(action: T['type'] | Array<T['type']>) => Observable<IActionEpic<S, T>>;

  dict: (path: string, factory: StoreFactory<IState, IAction>) => IStore<S, A>;
  add: (path: string, store: IStore<IState, IAction>) => IStore<S, A>;
  remove: (path: string, options?: { key?: string }) => IStore<S, A>;

  get: <S extends IState, A extends IAction>(
    path?: string,
    options?: { key?: string; initialState?: S },
  ) => IStore<S, A> | undefined;
}

/**
 * Factory that creates a new store instance.
 */
export type StoreFactory<S extends IState, A extends IAction> = (
  options?: StoreFactoryOptions<S>,
) => IStore<S, A>;

export type StoreFactoryOptions<S extends IState> = {
  initial?: S;
  path?: string;
  key?: string;
  [key: string]: any; // Other props.
};
