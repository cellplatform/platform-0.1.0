import { distinctUntilChanged } from 'rxjs/operators';

import { CmdBar, Json, t, time } from '../common';
import { CmdCardEvents } from '../logic';

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
  commandbar.state.$.pipe(distinctUntilChanged((prev, next) => prev.text === next.text)).subscribe(
    (e) => {
      /**
       * TODO 🐷
       * - This whole state/controller should probably not be up at the <CmdCard> level.
       */
      patch((state) => (state.commandbar.text = e.text));
    },
  );

  /**
   * API
   */
  time.delay(0, () => patch((state) => (state.ready = true)));
  return card;
}
