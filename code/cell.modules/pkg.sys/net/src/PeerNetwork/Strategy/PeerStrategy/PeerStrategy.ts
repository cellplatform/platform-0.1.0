import { t, Events } from '../common';
import { PeerConnectionStrategy } from './PeerConnectionStrategy';

/**
 * Single combined set of network strategies.
 */
export function PeerStrategy(args: { self: t.PeerId; bus: t.EventBus<any> }): t.PeerStrategy {
  const bus = args.bus.type<t.PeerEvent>();
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
