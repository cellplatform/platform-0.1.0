import { firstValueFrom, Subject } from 'rxjs';
import { filter, map, takeUntil } from 'rxjs/operators';

import { rx, slug, t } from '../common';
import { EventNamespace as ns } from './Events.ns';

/**
 * Helpers for working with group (mesh) related events.
 */
export function GroupEvents(args: { self: t.PeerId; netbus: t.NetBus<any> }) {
  const source = args.self;
  const dispose$ = new Subject<void>();
  const dispose = () => dispose$.next();
  const bus = args.netbus.type<t.GroupEvent>();

  const event$ = bus.event$.pipe(
    takeUntil(dispose$),
    filter(ns.is.group.base),
    map((e) => e as t.GroupEvent),
  );

  const connections = () => {
    const req$ = rx.payload<t.GroupConnectionsReqEvent>(event$, 'sys.net/group/connections:req');
    const res$ = rx.payload<t.GroupConnectionsResEvent>(event$, 'sys.net/group/connections:res');

    const get = (targets?: t.PeerId[]) => {
      const tx = slug();
      const res = firstValueFrom(res$.pipe(filter((e) => e.tx === tx)));
      bus.fire({
        type: 'sys.net/group/connections:req',
        payload: { source, targets, tx },
      });
      return res;
    };

    return { req$, res$, get };
  };

  return {
    dispose,
    dispose$,
    $: event$,
    connections,
  };
}
