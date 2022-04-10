import { CmdBar } from '../../Cmd.Bar';
import { Json, t, Util, time } from '../common';
import { CmdCardEvents } from '../events';

type O = Record<string, unknown>;
type S = t.CmdCardState;

/**
 * State controller for the <CmdCard>.
 */
export function StateController<A extends O = any, B extends O = any>(
  args: t.CmdCardStateControllerArgs,
) {
  const instance = args.instance.id;
  const fire = (e: t.CmdCardEvent) => args.instance.bus.fire(e);

  const events = CmdCardEvents<A, B>({
    instance: args.instance,
    dispose$: args.dispose$,
  });
  const { dispose$ } = events;

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
  CmdBar.State.Controller({
    dispose$,
    instance: args.instance,
    initial: _state.commandbar,
  });

  const commandbar = CmdBar.Events({ instance: args.instance, dispose$ });

  /**
   * Event Listeners.
   */
  events.state.$.subscribe(({ value }) => change((prev) => ({ ...prev, ...value })));
  commandbar.text.changed$.subscribe((e) => {
    change((prev) => {
      const commandbar = { ...prev.commandbar, text: e.to };
      return { ...prev, commandbar };
    });
  });

  /**
   * API
   */
  time.delay(0, () => change(() => _state));
  return events;
}
