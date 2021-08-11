import { t, rx, BusEvents, fs } from './common';

/**
 * Event controller.
 */
export function BusController(args: { bus: t.EventBus<any> }) {
  const bus = rx.busAsType<t.VercelEvent>(args.bus);
  const events = BusEvents({ bus });
  const { dispose, dispose$ } = events;

  return {
    dispose,
    dispose$,
  };
}
