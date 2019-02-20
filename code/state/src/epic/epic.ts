import { Observable } from 'rxjs';
import { filter, map } from 'rxjs/operators';
import { IState, IAction, IActionEpic, StateChange, IStore } from '../types';

/**
 * Reacts to a specific action (use for business logic and async operations).
 *
 *    1. Listen for a specific action(s).
 *    2. Perform some business logic, for instance calling the server.
 *    3. Dispatch new action(s) as a result.
 *
 */
export function on<S extends IState, A extends IAction>(
  action: A['type'] | Array<A['type']>,
  state$: Observable<StateChange<S, A>>,
  dispatch: IStore<S, A>['dispatch'],
): Observable<IActionEpic<S, A>> {
  const types = Array.isArray(action) ? action : [action];
  return (
    state$
      // Filter on specific action returning an observable
      // with the `dispatch` method.
      .pipe(
        filter(e => types.some(type => type === e.action.type)),
        map(e => ({ ...e, dispatch })),
      )
  );
}
