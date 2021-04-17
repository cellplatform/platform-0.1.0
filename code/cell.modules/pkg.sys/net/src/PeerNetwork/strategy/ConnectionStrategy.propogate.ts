import { filter, delay } from 'rxjs/operators';
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
  const netbus = events.data(self).bus<t.GroupEvent>();

  const getConnections = async () => {
    const { peer } = await events.status(self).get();
    return peer?.connections || [];
  };

  const getDataConnections = async () =>
    Filter.connectionsAs<t.PeerConnectionDataStatus>(await getConnections(), 'data');

  /**
   * Fire "ensure connected" events to peers when a connection is started locally.
   */
  connections.connectResponse$
    .pipe(
      delay(0),
      filter(() => args.isEnabled()),
      filter((e) => e.kind === 'data'),
      filter((e) => Boolean(e.connection)),
      filter((e) => e.direction === 'outgoing'),
    )
    .subscribe(async (e) => {
      const started = e.connection as t.PeerConnectionDataStatus;
      const current = await getDataConnections();

      if (current.length > 0) {
        const { isReliable } = started;
        const metadata = started.metadata;

        const connections = R.uniq(
          current.map((conn) => ({
            peer: conn.peer.remote,
            id: conn.id,
          })),
        );

        netbus.fire({
          type: 'sys.net/group/conn/ensure:data',
          payload: { from: self, connections, isReliable, metadata },
        });
      }
    });

  /**
   * Listen for incoming "ensure connected" events from other
   * peers broadcasting the set of ID's to connect to.
   */
  rx.payload<t.GroupEnsureConnectedDataEvent>(netbus.event$, 'sys.net/group/conn/ensure:data')
    .pipe(delay(0))
    .subscribe(async (e) => {
      const { isReliable, metadata } = e;
      const current = await getDataConnections();

      const connections = R.uniq(
        e.connections
          .filter((item) => item.peer !== self)
          .filter((item) => !current.some((conn) => conn.id === item.id))
          .filter((item) => !current.some((conn) => conn.peer.remote === item.peer)),
      );

      connections.forEach((item) => {
        events.connection(self, item.peer).open.data({ isReliable, metadata });
      });
    });
}
