import { map } from 'rxjs/operators';

import { t, Uri, NetworkBus } from '../common';
import { Events } from './Events';

/**
 * An event-bus distributed across a number of peers.
 */
export function PeerBus<E extends t.Event>(args: {
  self: t.PeerId;
  bus: t.EventBus<any>;
}): t.PeerBus<E> {
  const { self } = args;
  const events = Events(args.bus);
  const data = events.data(self);
  const { dispose, dispose$ } = events;

  const netbus = NetworkBus<E>({
    local: async () => Uri.peer.create(self),
    remotes: async () => {
      const uri = Uri.connection.create;
      return connections.map((conn) => uri(conn.kind, conn.peer.remote.id, conn.id));
    },
    out: (e) => data.send(e.event, { targets: e.targets }),
    in$: data.in$.pipe(map((e) => e.data as E)),
  });

  // Maintain a list of connections.
  let connections: t.PeerConnectionStatus[];
  events.status(self).changed$.subscribe((e) => (connections = e.peer.connections));
  events
    .status(self)
    .get()
    .then((e) => (connections = e.peer?.connections || []));

  /**
   * API
   */
  return {
    ...netbus,
    dispose,
    dispose$,
    self,
    get connections() {
      return connections;
    },
  };
}
