import { IStateChange, IStoreEvent } from '@platform/state';
import { Observable } from 'rxjs';

export { IStoreEvent };

/**
 * The context object that is passed down through the React hierarchy.
 */
export type IStateContext = {
  getStore<M extends {}, E extends IStoreEvent>(): IStoreContext<M, E>;
};

/**
 * A representation of the store containing the current state
 * with methods to dispatch change requests.
 */
export type IStoreContext<M extends {} = {}, E extends IStoreEvent = IStoreEvent> = {
  state: M;
  changed$: Observable<IStateChange>;
  dispatch(event: E): IStoreContext<M, E>;
};
