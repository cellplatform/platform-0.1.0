import { rx, t } from '../common';
import { Events } from '../Menu.Events';
import { LoadController } from './Controller.load';
import { StatusController } from './Controller.status';
import { PatchController } from './Controller.patch';

/**
 * Behavioral event controller.
 */
export function Controller(args: { bus: t.EventBus<any> }) {
  const bus = rx.busAsType<t.MenuEvent>(args.bus);
  const events = Events({ bus });
  const { dispose, dispose$ } = events;

  // Status reference
  const ref = { current: [] as t.Menu };

  // Initialise sub-controllers.
  LoadController({ bus, events, ref });
  StatusController({ bus, events, ref });
  PatchController({ bus, events });

  return {
    dispose,
    dispose$,
  };
}
