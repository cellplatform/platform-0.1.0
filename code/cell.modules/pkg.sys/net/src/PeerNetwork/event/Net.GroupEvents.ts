import { firstValueFrom, Subject } from 'rxjs';
import { filter, map, takeUntil } from 'rxjs/operators';

import { rx, slug, t, WebRuntime } from '../common';
import { EventNamespace as ns } from './Events.ns';

/**
 * Helpers for working with group (mesh) related events.
 */
export function GroupEvents(args: { netbus: t.NetBus<any> }) {
  const module = { name: WebRuntime.module.name, version: WebRuntime.module.version };
  const netbus = args.netbus.type<t.GroupEvent>();
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

    const get = async (targets?: t.PeerId[]) => {
      const local: t.GroupConnectionsResPeer = {
        peer: source,
        module,
        connections: netbus.connections.map((ref) => ({ id: ref.id, kind: ref.kind })),
      };

      if (local.connections.filter(({ kind }) => kind === 'data').length === 0) {
        return { local, remote: [] };
      }

      const tx = slug();
      const res = firstValueFrom(res$.pipe(filter((e) => e.tx === tx)));
      netbus.target().local({
        type: 'sys.net/group/connections:req',
        payload: { source, targets, tx },
      });

      return {
        local,
        remote: (await res).peers,
      };
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
