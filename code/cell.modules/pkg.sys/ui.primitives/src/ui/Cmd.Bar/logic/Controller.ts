import { Observable } from 'rxjs';

import { t, Json, TextInput } from '../common';
import { CmdBarEvents } from './Events';

export type CmdBarControllerArgs = {
  instance: t.CmdBarInstance;
  initial?: t.CmdBarState;
  dispose$?: Observable<any>;
};

/**
 * State controller for the <CmdBar>.
 */
export function CmdBarController(args: CmdBarControllerArgs): t.CmdBarEventsDisposable {
  const { instance } = args;
  const events = CmdBarEvents({ instance, dispose$: args.dispose$ });
  const { dispose$ } = events;
  const patch = events.state.patch;

  /**
   * Sub-controllers.
   */
  Json.Bus.Controller({ instance, dispose$ });

  /**
   * TODO 🐷
   * Future "command bar" specific logic event interpretation and control.
   */

  const textbox = TextInput.Events({ instance: args.instance, dispose$ });

  textbox.text.changing$.subscribe((e) => {
    console.log('$ changing:', e);
    patch((state) => (state.text = e.to));
  });

  /**
   * API
   */
  // time.delay(0, () => patch((state) => (state.ready = true)));
  return events;
}
