import { t, rx } from '../common';
import { Events } from './Name.Events';

/**
 * Behavioral event controller.
 */
export function Controller(args: { bus: t.EventBus<any> }) {
  const bus = rx.busAsType<t.NameEvent>(args.bus);
  const events = Events({ bus });
  const { dispose, dispose$ } = events;

  return {
    dispose,
    dispose$,
  };
}
