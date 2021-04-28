import { firstValueFrom, Subject } from 'rxjs';
import { filter, map, takeUntil } from 'rxjs/operators';

import { rx, slug, t, WebRuntime } from '../common';
import { EventNamespace as ns } from './Events.ns';

type P = t.GroupPeer;
type C = t.GroupPeerConnection;

/**
 * Helpers for working with group (mesh) related events.
 */
export function GroupEvents(eventbus: t.NetBus<any>) {
  const module = { name: WebRuntime.module.name, version: WebRuntime.module.version };
  const netbus = eventbus.type<t.GroupEvent>();
  const source = netbus.self;
  const dispose$ = new Subject<void>();
  const dispose = () => dispose$.next();

  const event$ = netbus.event$.pipe(
    takeUntil(dispose$),
    filter(ns.is.group.base),
    map((e) => e as t.GroupEvent),
  );

  const connections = () => {
    const req$ = rx.payload<t.GroupConnectionsReqEvent>(event$, 'sys.net/group/connections:req');
    const res$ = rx.payload<t.GroupConnectionsResEvent>(event$, 'sys.net/group/connections:res');

    /**
     * Calculate the entire group from available connections.
     */
    const get = async (targets?: t.PeerId[]): Promise<t.GroupPeerStatus> => {
      const local: P = {
        peer: source,
        module,
        connections: netbus.connections.map(({ id, kind, parent }) => ({
          id,
          kind,
          parent,
        })),
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

  const connect = () => {
    const $ = rx.payload<t.GroupConnectEvent>(event$, 'sys.net/group/connect');

    /**
     * TODO 🐷
     * clear up param names.
     */

    const fire = (target: t.PeerId, peer: t.PeerId, kind: t.PeerConnectionKind) =>
      netbus.target.peer(target).fire({
        type: 'sys.net/group/connect',
        payload: { source, target: { peer, kind } },
      });
    return { $, fire };
  };

  const refresh = () => {
    const $ = rx.payload<t.GroupRefreshEvent>(event$, 'sys.net/group/refresh');
    const fire = () => netbus.fire({ type: 'sys.net/group/refresh', payload: { source } });
    return { $, fire };
  };

  const fs = () => {
    const files$ = rx.payload<t.GroupFsFilesEvent>(event$, 'sys.net/group/fs/files');

    const fire = (args: { files: t.GroupFileData[]; dir?: string; filter?: t.PeerFilter }) => {
      const { files, dir = '', filter } = args;
      console.log('file', args);
      netbus.target.filter(args.filter).fire({
        type: 'sys.net/group/fs/files',
        payload: { source, dir, files },
      });
    };

    return { files$, fire };
  };

  return {
    $: event$,
    dispose$,
    dispose,
    connections,
    refresh,
    connect,
    fs,
  };
}

/**
 * [Helpers]
 */

const isLocal = (local: P, id: t.PeerConnectionId) => local.connections.some((c) => c.id === id);

const toPending = (local: P, remote: P[]) => {
  const res: C[] = [];
  remote.forEach((item) => {
    const peer = item.peer;
    item.connections
      .filter((conn) => !isLocal(local, conn.id))
      .forEach(({ id, kind, parent }) => res.push({ peer, connection: id, kind, parent }));
  });
  return res;
};
