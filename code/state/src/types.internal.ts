import { Subject } from 'rxjs';
import { IStore, IState, IAction, StateChange, Reducer, StoreFactory } from './types';

export * from './types';

export interface IReducerItem<S extends IState, A extends IAction> {
  reducer: Reducer<S, A>;
  actionType?: string;
}
export type IReducerItems<S extends IState, A extends IAction> = Array<IReducerItem<S, A>>;

export interface IData<S extends IState, A extends IAction> {
  key?: string; // Used to identify a child or dictionary-child store.
  reducers: IReducerItems<S, A>;
  children: IChildStore[];
  childDictionaries: IDictionaryStore[];
  parent?: StoreInternal<S, A>;
  current: S;
  state$: Subject<StateChange<S, A>>;
  context?: any;
}

export type StoreInternal<S extends IState, A extends IAction> = IStore<S, A> & {
  data: IData<S, A>;
};

export interface IChildStore {
  path: string;
  store: StoreInternal<IState, IAction>;
}

export interface IDictionaryStore {
  path: string;
  factory: StoreFactory<IState, IAction>;
  items: IChildStore[];
  isPersistent: boolean; // Flag indicating if the object should be removed from the state tree if all children are removed.
}
