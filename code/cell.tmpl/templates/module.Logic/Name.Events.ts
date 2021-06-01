import { t, rx } from '../common';

/**
 * Event API.
 */
export function Events(args: { bus: t.EventBus<any> }) {
  const bus = rx.busAsType<t.BundleEvent>(args.bus);
  return {};
}
