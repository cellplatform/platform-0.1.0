import { firstValueFrom, Subject } from 'rxjs';
import { filter, map, takeUntil } from 'rxjs/operators';

import { rx, slug, t, WebRuntime } from '../common';
import { EventNamespace as ns } from './Events.ns';

type P = t.GroupPeer;
type C = t.GroupPeerConnection;

/**
 * Helpers for working with network filesystem related events.
 */
export function FilesystemEvents(eventbus: t.PeerNetworkBus<any>) {
  const netbus = eventbus as t.PeerNetworkBus<t.NetFsEvent>;
  const source = netbus.self;
  const dispose$ = new Subject<void>();
  const dispose = () => dispose$.next();

  const event$ = netbus.$.pipe(
    takeUntil(dispose$),
    filter(ns.is.fs.base),
    map((e) => e as t.NetGroupEvent),
  );

  const add = () => {
    const $ = rx.payload<t.NetFsAddEvent>(event$, 'sys.net/fs/add');

    const fire = (args: { files: t.PeerFile[]; filter?: t.NetworkBusFilter }) => {
      const { files, filter } = args;
      netbus.target.filter(filter).fire({
        type: 'sys.net/fs/add',
        payload: { source, files },
      });
    };

    return { $, fire };
  };

  return {
    $: event$,
    dispose$,
    dispose,
    add,
  };
}
