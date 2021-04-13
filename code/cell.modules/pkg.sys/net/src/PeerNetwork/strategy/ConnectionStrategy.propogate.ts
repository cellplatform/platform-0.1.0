import { filter } from 'rxjs/operators';
import { t, rx, R } from '../common';
import { Filter } from '../util';

/**
 * Strategy for auto propogating connections to all peers.
 */
export function autoPropagation(args: {
  self: t.PeerId;
  events: t.PeerNetworkEvents;
  isEnabled: () => boolean;
}) {
  const { self, events } = args;
  const connections = events.connections(self);
  const netbus = events.data(self).bus<t.MeshEvent>();

  const getConnections = async () => {
    const { peer } = await events.status(self).get();
    return peer?.connections || [];
  };

  const getDataConnections = async () =>
    Filter.connectionsAs<t.PeerConnectionDataStatus>(await getConnections(), 'data');

  /**
   * Fire "ensure connected" events to peers when connection started locally.
   */
  connections.connectResponse$
    .pipe(
      filter(() => args.isEnabled()),
      filter((e) => e.kind === 'data'),
      filter((e) => Boolean(e.connection)),
    )
    .subscribe(async (e) => {
      const { isReliable, metadata } = e.connection as t.PeerConnectionDataStatus;
      const connections = await getDataConnections();
      const peers = R.uniq(connections.map((conn) => conn.peer.remote));
      if (peers.length > 0) {
        netbus.fire({
          type: 'sys.net/mesh/ensureConnected:data',
          payload: { from: self, peers, isReliable, metadata },
        });
      }
    });

  /**
   * Listen for incoming "ensure connections" events from other
   * peers broadcasting the set of ID's to connect to.
   */
  rx.payload<t.MeshEnsureConnectedDataEvent>(netbus.event$, 'sys.net/mesh/ensureConnected:data')
    .pipe()
    .subscribe(async (e) => {
      const { isReliable } = e;
      const connections = await getDataConnections();

      const peers = R.uniq(
        e.peers
          .filter((id) => id !== self)
          .filter((id) => !connections.some((item) => item.peer.remote === id)),
      );

      peers.forEach((remote) => {
        events.connection(self, remote).open.data({ isReliable });
      });
    });
}
