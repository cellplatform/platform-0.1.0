import { t, Events } from '../common';
import { PeerConnectionStrategy } from './PeerConnectionStrategy';

/**
 * Single combined set of network strategies.
 */
export function PeerStrategy(args: {
  bus: t.EventBus<any>;
  netbus: t.PeerNetworkBus<any>;
}): t.PeerStrategy {
  const bus = args.bus as t.EventBus<t.PeerEvent>;
  const events = Events(bus);

  const connection = PeerConnectionStrategy(args);

  return {
    connection,

    dispose$: events.dispose$,
    dispose() {
      events.dispose();
      connection.dispose();
    },
  };
}
