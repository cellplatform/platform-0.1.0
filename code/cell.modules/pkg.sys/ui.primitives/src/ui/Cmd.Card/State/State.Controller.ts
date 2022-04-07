import { Observable } from 'rxjs';

import { CmdBarState } from '../../Cmd.Bar/State';
import { Json, t, Util } from '../common';
import { CmdCardEvents } from '../Events';

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
  const change = (fn: (prev: S) => S) => {
    const state = (_state = fn(_state));
    fire({
      type: 'sys.ui.CmdCard/state:changed',
      payload: { instance, state },
    });
  };

  /**
   * Sub-controllers
   */
  Json.Bus.Controller({ instance: args.instance, dispose$ });
  const bar = CmdBarState.Controller({
    dispose$,
    bus,
    instance: args.instance,
    initial: _state.commandbar,
  });

  /**
   * Event Listeners.
   */
  events.state.$.subscribe(({ value }) => change((prev) => ({ ...prev, ...value })));
  bar.state$.subscribe((bar) => change((prev) => ({ ...prev, commandbar: bar })));

  /**
   * API
   */
  const api = {
    instance: events.instance,
    dispose$,
    dispose,
    state$: events.state$,
    get state() {
      return _state;
    },
  };
  return api;
}
