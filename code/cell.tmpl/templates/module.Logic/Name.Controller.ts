import { t, rx } from '../common';
import { BusEvents } from './Name.Events';

/**
 * Behavioral event controller.
 */
export function Controller(args: { bus: t.EventBus<any> }) {
  const bus = rx.busAsType<t.NameEvent>(args.bus);
  const events = BusEvents({ bus });
  const { dispose, dispose$ } = events;

  return {
    dispose,
    dispose$,
  };
}
