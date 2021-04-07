import { filter } from 'rxjs/operators';

import { t, rx, R } from '../common';
import { Events } from '../Events';
import { Filter } from '../util';
import { autoPerge, ensureClosed } from './ConnectionStrategy.close';

/**
 * Handles strategies for connecting and disconnecting peers.
 */
export function ConnectionStrategy(args: {
  self: t.PeerId;
  bus: t.EventBus<any>;
}): t.PeerConnectionStrategy {
  const { self } = args;
  const bus = args.bus.type<t.PeerEvent>();
  const events = Events({ bus });
  const connections = events.connections(self);
  const netbus = events.data(self).bus<t.MeshEvent>();

  const getConnections = async () => {
    const { peer } = await events.status(self).get();
    return peer?.connections || [];
  };

  const getDataConnections = async () =>
    Filter.connectionsAs<t.PeerConnectionDataStatus>(await getConnections(), 'data');

  /**
   * Initialize sub-strategies.
   */
  autoPerge({ self, events, isEnabled: () => strategy.autoPurgeOnClose });
  ensureClosed({ self, events, isEnabled: () => strategy.ensureConnectionClosed });

  /**
   * Auto propogate connections to peers.
   */
  connections.connectResponse$
    .pipe(
      filter(() => strategy.autoPropagation),
      filter((e) => e.kind === 'data'),
      filter((e) => Boolean(e.connection)),
    )
    .subscribe(async (e) => {
      const { isReliable, metadata } = e.connection as t.PeerConnectionDataStatus;
      const connections = await getDataConnections();
      const peers = R.uniq(connections.map((conn) => conn.peer.remote));
      if (peers.length > 0) {
        netbus.fire({
          type: 'Mesh/ensureConnected:data',
          payload: { from: self, peers, isReliable, metadata },
        });
      }
    });

  /**
   * Listen for incoming "ensure connections" events from other
   * peers broadcasting the set of ID's to connect to.
   */
  rx.payload<t.MeshEnsureConnectedDataEvent>(netbus.event$, 'Mesh/ensureConnected:data')
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

  /**
   * API
   */
  const strategy = {
    dispose$: events.dispose$,
    dispose: events.dispose,

    autoPurgeOnClose: true,
    autoPropagation: true,
    ensureConnectionClosed: true,
  };

  return strategy;
}
