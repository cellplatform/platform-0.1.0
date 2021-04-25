import { firstValueFrom, Subject } from 'rxjs';
import { filter, map, takeUntil } from 'rxjs/operators';

import { rx, slug, t, WebRuntime } from '../common';
import { EventNamespace as ns } from './Events.ns';

type R = t.GroupConnectionsResPeer;
type P = { peer: t.PeerId; connection: t.PeerConnectionId; kind: t.PeerConnectionKind };

/**
 * Helpers for working with group (mesh) related events.
 */
export function GroupEvents(eventbus: t.NetBus<any>) {
  const module = { name: WebRuntime.module.name, version: WebRuntime.module.version };
  const netbus = eventbus.type<t.GroupEvent>();
  const source = netbus.self;
  const dispose$ = new Subject<void>();
  const dispose = () => dispose$.next();

  const $ = netbus.event$.pipe(
    takeUntil(dispose$),
    filter(ns.is.group.base),
    map((e) => e as t.GroupEvent),
  );

  const connections = () => {
    const req$ = rx.payload<t.GroupConnectionsReqEvent>($, 'sys.net/group/connections:req');
    const res$ = rx.payload<t.GroupConnectionsResEvent>($, 'sys.net/group/connections:res');

    /**
     * Calculate the entire group from available connections.
     */
    const get = async (targets?: t.PeerId[]) => {
      const local: R = {
        peer: source,
        module,
        connections: netbus.connections.map((ref) => ({ id: ref.id, kind: ref.kind })),
      };

      const total = local.connections.filter(({ kind }) => kind === 'data').length;
      if (total === 0) return { local, remote: [], pending: [] };

      const tx = slug();
      const res = firstValueFrom(res$.pipe(filter((e) => e.tx === tx)));
      netbus.target.local({
        type: 'sys.net/group/connections:req',
        payload: { source, targets, tx },
      });

      const remote = (await res).peers;
      const pending = toPending(local, remote);
      return { local, remote, pending };
    };

    return { req$, res$, get };
  };

  return {
    $,
    dispose$,
    dispose,
    connections,
  };
}

/**
 * [Helpers]
 */

const isLocal = (local: R, id: t.PeerConnectionId) => local.connections.some((c) => c.id === id);

const toPending = (local: R, remote: R[]) => {
  const res: P[] = [];
  remote.forEach((item) => {
    const peer = item.peer;
    item.connections
      .filter((conn) => !isLocal(local, conn.id))
      .forEach(({ id, kind }) => res.push({ peer, connection: id, kind }));
  });
  return res;
};
