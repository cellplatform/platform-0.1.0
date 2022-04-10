import { CmdBar } from '../../Cmd.Bar';
import { Json, t, Util, time } from '../common';
import { CmdCardEvents } from '../logic';

type O = Record<string, unknown>;
type S = t.CmdCardState;

/**
 * State controller for the <CmdCard>.
 */
export function StateController<A extends O = any, B extends O = any>(
  args: t.CmdCardStateControllerArgs,
): t.CmdCardStateController {
  const instance = args.instance.id;
  const fire = (e: t.CmdCardEvent) => args.instance.bus.fire(e);

  const card = CmdCardEvents<A, B>({
    instance: args.instance,
    dispose$: args.dispose$,
  });
  const { dispose$ } = card;

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
  card.state.$.subscribe(({ value }) => change((prev) => ({ ...prev, ...value })));

  commandbar.text.changed$.subscribe((e) => {
    change((prev) => {
      const text = e.to;
      return { ...prev, commandbar: { ...prev.commandbar, text } };
    });
  });

  /**
   * API
   */
  time.delay(0, () => change(() => _state));
  return card;
}
