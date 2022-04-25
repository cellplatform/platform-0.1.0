import { CmdBar, Json, t, time } from '../common';
import { CmdCardEvents } from '../logic';

type O = Record<string, unknown>;

/**
 * State controller for the <CmdCard>.
 */
export function CmdCardController(args: t.CmdCardControllerArgs): t.CmdCardEventsDisposable {
  const { instance } = args;

  const card = CmdCardEvents({
    instance: args.instance,
    dispose$: args.dispose$,
    initial: args.initial,
  });
  const { dispose$ } = card;
  const patch = card.state.patch;

  /**
   * Sub-controllers.
   */
  Json.Bus.Controller({ instance, dispose$ });
  const commandbar = CmdBar.Controller({ instance, dispose$ });

  /**
   * Event Listeners.
   */
  commandbar.text.changed$.subscribe(async (e) => {
    await patch((state) => (state.commandbar.text = e.to));
  });

  /**
   * API
   */
  time.delay(0, () => patch((state) => (state.ready = true)));
  return card;
}
