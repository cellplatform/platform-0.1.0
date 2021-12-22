import { Subject } from 'rxjs';

import { rx, t } from './common';
import { NetworkBus } from './NetworkBus';

/**
 * A mock network bus.
 * NOTE: useful for when an environment does not support the kind of
 *       bus being requested but an object needs to be returned.
 */
export function NetworkBusMock<E extends t.Event = t.Event>(
  options: { local?: t.NetworkBusUri; remotes?: t.NetworkBusUri[] } = {},
): t.NetworkBusMock<E> {
  const in$ = new Subject<E>();

  const mock: t.NetworkBusMock<E>['mock'] = {
    remotes: [],
    in: { $: in$, next: (e) => in$.next(e) },
    out: [],
    local: options.local ?? 'uri:me',
    remote(uri, eventbus) {
      const bus = eventbus ?? rx.bus<E>();
      const item: t.NetworkBusMockRemote<E> = { uri, bus, fired: [] };
      bus.$.subscribe((e) => item.fired.push(e));
      mock.remotes.push(item);
      return item;
    },
  };

  const pump: t.NetworkPump<E> = {
    in: (fn) => mock.in.$.subscribe(fn),
    out: (e) => mock.out.push(e),
  };

  const netbus = NetworkBus<E>({
    pump,
    local: async () => mock.local,
    remotes: async () => mock.remotes.map(({ uri }) => uri),
  });

  options.remotes?.forEach((uri) => mock.remote(uri));
  return { ...netbus, mock };
}
