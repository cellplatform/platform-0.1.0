import { firstValueFrom, of, timeout } from 'rxjs';
import { catchError, filter, takeUntil } from 'rxjs/operators';
import { t, rx, DEFAULT, slug } from './common';
import { BusEvents } from './BusEvents';

type InstanceId = string;

/**
 * Network group event API for the "WebRuntime"
 */
export function GroupEvents(args: {
  netbus: t.NetworkBus<any>;
  id?: InstanceId;
}): t.WebRuntimeGroupEvents {
  const netbus = args.netbus as t.NetworkBus<t.WebRuntimeGroupEvent>;
  const { dispose, dispose$ } = rx.disposable();
  const id = args.id ?? DEFAULT.id;

  const $ = netbus.$.pipe(
    takeUntil(dispose$),
    filter((e) => e.type === 'sys.runtime.web/group'),
  );

  /**
   * Use remote module
   */
  const useModule: t.WebRuntimeEvents['useModule'] = {
    $: rx.payload<t.WebRuntimeUseModuleEvent>($, 'sys.runtime.web/useModule'),
    async fire(args) {
      const { target, module } = args;

      const event: t.WebRuntimeUseModuleEvent = {
        type: 'sys.runtime.web/useModule',
        payload: { id, target, module },
      };

      netbus.target.remote({
        type: 'sys.runtime.web/group',
        payload: { id, event },
      });
    },
  };

  return { $, dispose, dispose$, useModule };
}
