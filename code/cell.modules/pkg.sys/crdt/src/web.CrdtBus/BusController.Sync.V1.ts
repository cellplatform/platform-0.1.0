import { DEFAULT, pkg, rx, slug, t } from './common';

/**
 * Network sync via [getChanges/applyChanges].
 *
 * NOTE:
 *    This uses the initial API of Automerge.
 *    In the future upgrade to use the Automerge SYNC protocol
 *    that is more efficient (employing Bloom filters).
 */

export function BusControllerSyncV1(args: {
  bus: t.EventBus<any>;
  netbus: t.NetworkBus<any>;
  events: t.CrdtEvents;
}) {
  const { events } = args;
  const id = events.id;
  const bus = rx.busAsType<t.CrdtEvent>(args.bus);

  console.log('BusControllerSyncV1/id:', id);
}
