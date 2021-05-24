import { map } from 'rxjs/operators';
import { t, Uri, NetworkBus, Events } from './common';

/**
 * An event-bus distributed across a number of peers.
 */
export function PeerNetworkBus<E extends t.Event>(args: {
  self: t.PeerId;
  bus: t.EventBus<any>;
}): t.PeerNetworkBus<E> {
  const { self } = args;
  const events = Events(args.bus);
  const data = events.data(self);
  const { dispose, dispose$ } = events;

  const pump: t.NetworkPump<E> = {
    in: (fn) => data.in$.pipe(map((e) => e.data as E)).subscribe(fn),
    out: (e) => data.send(e.event, { targets: e.targets }),
  };

  const netbus = NetworkBus<E>({
    pump,
    local: async () => Uri.peer.create(self),
    remotes: async () => {
      const uri = Uri.connection.create;
      return connections.map((conn) => uri(conn.kind, conn.peer.remote.id, conn.id));
    },
  });

  // Maintain a list of connections.
  let connections: t.PeerConnectionStatus[];
  events.status(self).changed$.subscribe((e) => (connections = e.peer.connections));
  events
    .status(self)
    .get()
    .then((e) => (connections = e.peer?.connections || [])); // NB: Initial load of current connections.

  /**
   * API
   */
  return {
    ...netbus,
    self,
    get connections() {
      return connections;
    },
    dispose,
    dispose$,
  };
}
