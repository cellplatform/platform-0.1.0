import { Observable } from 'rxjs';

import { t } from '../common';
import { CmdBarEvents } from '../logic';

export type CmdBarControllerArgs = {
  instance: t.CmdBarInstance;
  dispose$?: Observable<any>;
};

/**
 * State controller for the <CmdBar>.
 */
export function CmdBarController(args: CmdBarControllerArgs): t.CmdBarEventsDisposable {
  const { instance } = args;
  const events = CmdBarEvents({ instance, dispose$: args.dispose$ });

  /**
   * TODO 🐷
   * Future "command bar" specific logic event interpretation and control.
   */

  /**
   * API
   */
  return events;
}
