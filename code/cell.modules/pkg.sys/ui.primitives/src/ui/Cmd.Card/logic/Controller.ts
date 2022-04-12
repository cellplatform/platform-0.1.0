import { CmdBar } from '../../Cmd.Bar';
import { Json, t, Util, time } from '../common';
import { CmdCardEvents } from '../logic';

type O = Record<string, unknown>;
type S = t.CmdCardState;

/**
 * State controller for the <CmdCard>.
 */
export function CmdCardController<A extends O = any, B extends O = any>(
  args: t.CmdCardControllerArgs,
): t.CmdCardEventsDisposable {
  const { instance } = args;

  const card = CmdCardEvents<A, B>({
    instance: args.instance,
    dispose$: args.dispose$,
    initial: args.initial,
  });
  const { dispose$ } = card;

  /**
   * Sub-controllers
   */
  Json.Bus.Controller({ instance, dispose$ });
  const commandbar = CmdBar.Controller({ instance, dispose$ });

  /**
   * Event Listeners.
   */
  card.state.$.subscribe(({ value }) => {
    console.log('state change'); // TEMP 🐷
  });

  commandbar.text.changed$.subscribe(async (e) => {
    await card.state.patch((state) => (state.commandbar.text = e.to));
  });

  /**
   * API
   */
  time.delay(0, () => card.state.patch((state) => (state.ready = true)));
  return card;
}
