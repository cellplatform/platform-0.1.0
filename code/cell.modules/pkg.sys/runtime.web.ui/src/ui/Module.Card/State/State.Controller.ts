import { t } from '../common';
import { ModuleCardEvents } from '../Events';

type S = t.ModuleCardState;

export type StateControllerArgs = {
  instance: t.ModuleCardInstance;
  bus?: t.EventBus<any>;
  initial?: S;
  dispose$?: t.Observable<any>;
};

/**
 * State controller for the <ModuleCard>.
 */
export function StateController(args: StateControllerArgs) {
  const events = ModuleCardEvents({
    instance: args.instance,
    dispose$: args.dispose$,
  });
  const { dispose, dispose$ } = events;

  /**
   * TODO 🐷
   */

  return {
    instance: events.instance,
    dispose,
    dispose$,
  };
}
