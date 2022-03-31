import { BehaviorSubject, Observable } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { CmdBarState } from '../../Cmd.Bar/State';
import { Patch, t } from '../common';
import { CmdCardEvents } from '../Events';
import { Util } from '../Util';

type S = t.CmdCardState;

export type StateControllerArgs = {
  instance: t.CmdCardInstance;
  bus?: t.EventBus<any>;
  initial?: S;
  dispose$?: Observable<any>;
};

/**
 * State controller for the <CmdCard>.
 */
export function StateController(args: StateControllerArgs) {
  const { bus } = args;
  const instance = args.instance.id;
  const fire = (e: t.CmdCardEvent) => args.instance.bus.fire(e);

  const events = CmdCardEvents({
    instance: args.instance,
    dispose$: args.dispose$,
  });
  const { dispose, dispose$ } = events;

  /**
   * State.
   */
  let _state: S = args.initial ?? Util.defaultState();
  const state$ = new BehaviorSubject<S>(_state);
  const change = (fn: (prev: S) => S) => {
    _state = fn(_state);
    state$.next(_state);
  };

  /**
   * <CmdBar> sub-controller.
   */
  const bar = CmdBarState.Controller({
    dispose$,
    bus,
    instance: args.instance,
    initial: _state.commandbar,
  });
  bar.state$.subscribe((bar) => {
    change((prev) => ({ ...prev, commandbar: bar }));
  });

  /**
   * EVENT HANDLERS
   */

  /**
   * Retrieve current state
   */
  events.state.req$.subscribe((e) => {
    fire({
      type: 'sys.ui.CmdCard/state:res',
      payload: { instance, tx: e.tx, state: api.state },
    });
  });

  /**
   * Update state (via immutable patches).
   */
  events.state.patch$.subscribe((e) => {
    change(() => Patch.apply(api.state, e.patches));
  });

  /**
   * API
   */
  const api = {
    dispose$,
    dispose,
    state$: state$.pipe(takeUntil(dispose$)),
    get state() {
      return _state;
    },
  };
  return api;
}
