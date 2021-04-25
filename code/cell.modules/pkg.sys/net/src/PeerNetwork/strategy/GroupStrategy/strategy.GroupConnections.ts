import { firstValueFrom } from 'rxjs';
import { filter, timeout } from 'rxjs/operators';

import { slug, t, WebRuntime } from '../common';

/**
 * Strategy for retrieving peer/connection details for members of the mesh network.
 */
export async function GroupConnectionsStrategy(args: {
  netbus: t.NetBus<t.GroupEvent>;
  events: t.GroupEvents;
  isEnabled: () => boolean;
}) {
  const { netbus, events } = args;
  const module = { name: WebRuntime.module.name, version: WebRuntime.module.version };
  const self = netbus.self;
  const req$ = events.connections().req$.pipe(filter(() => args.isEnabled()));
  const res$ = events.connections().res$.pipe(filter(() => args.isEnabled()));

  /**
   * Listen for local requests,
   * then broadcast event out to all connected peers.
   */
  req$.pipe(filter((e) => e.source === self)).subscribe(async (payload) => {
    const tx = slug();
    const targets = netbus.connections.map((conn) => conn.peer.remote.id);
    const { sent } = await netbus.target().remote({
      type: 'sys.net/group/connections:req',
      payload: { source: self, targets, tx },
    });

    const waitFor = sent.map((item) =>
      firstValueFrom(
        res$.pipe(
          filter((e) => e.tx === tx),
          filter((e) => e.source === item.peer),
          timeout(5000),
        ),
      ),
    );

    type P = t.GroupConnectionsResPeer;
    const res = await Promise.all(waitFor);
    const peers = res.reduce((acc, next) => [...acc, ...next.peers], [] as P[]);
    netbus.target().local({
      type: 'sys.net/group/connections:res',
      payload: { tx: payload.tx || '', source: self, peers },
    });
  });

  /**
   * Listen for remote requests.
   */
  req$.pipe(filter((e) => e.source !== self)).subscribe(async (payload) => {
    const tx = payload.tx || slug();
    const connections = netbus.connections.map((ref) => ({ id: ref.id, kind: ref.kind }));
    const peer: t.GroupConnectionsResPeer = { peer: self, module, connections };
    netbus
      .target((e) => e.peer === payload.source)
      .fire({
        type: 'sys.net/group/connections:res',
        payload: { tx, source: self, peers: [peer] },
      });
  });
}
