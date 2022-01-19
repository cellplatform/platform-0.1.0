import { filter, takeUntil } from 'rxjs/operators';

import { DEFAULT, rx, slug, t } from './common';

type InstanceId = string;

/**
 * Event API for the "WebRuntime"
 */
export function BusEvents(args: {
  bus: t.EventBus<any>;
  id?: InstanceId;
  filter?: (e: t.WebRuntimeEvent) => boolean;
}): t.WebRuntimeEvents {
  const { dispose, dispose$ } = rx.disposable();
  const id = args.id ?? DEFAULT.id;
  const bus = rx.busAsType<t.WebRuntimeEvent>(args.bus);
  const is = BusEvents.is;

  const $ = bus.$.pipe(
    takeUntil(dispose$),
    filter((e) => is.instance(e, id)),
    filter((e) => args.filter?.(e) ?? true),
  );

  /**
   * Base information about the module.
   */
  const info: t.WebRuntimeEvents['info'] = {
    req$: rx.payload<t.WebRuntimeInfoReqEvent>($, 'sys.runtime.web/info:req'),
    res$: rx.payload<t.WebRuntimeInfoResEvent>($, 'sys.runtime.web/info:res'),
    async get(options = {}) {
      const { timeout = 90000 } = options;
      const tx = slug();
      const op = 'info';
      const res$ = info.res$.pipe(filter((e) => e.tx === tx));
      const first = rx.asPromise.first<t.WebRuntimeInfoResEvent>(res$, { op, timeout });

      bus.fire({
        type: 'sys.runtime.web/info:req',
        payload: { tx, id },
      });

      const res = await first;
      if (res.payload) return res.payload;

      const error = res.error?.message ?? 'Failed';
      return { tx, id, exists: false, error };
    },
  };

  /**
   * Use remote module.
   */
  const useModule: t.WebRuntimeEvents['useModule'] = {
    $: rx.payload<t.WebRuntimeUseModuleEvent>($, 'sys.runtime.web/useModule'),
    async fire(args) {
      const { target, module } = args;
      bus.fire({
        type: 'sys.runtime.web/useModule',
        payload: { id, target, module },
      });
    },
  };

  /**
   * Netbus request.
   */
  const netbus: t.WebRuntimeEvents['netbus'] = {
    req$: rx.payload<t.WebRuntimeNetbusReqEvent>($, 'sys.runtime.web/netbus:req'),
    res$: rx.payload<t.WebRuntimeNetbusResEvent>($, 'sys.runtime.web/netbus:res'),
    async get(options = {}) {
      const { timeout = 500 } = options;
      const tx = slug();
      const op = 'netbus';
      const res$ = netbus.res$.pipe(filter((e) => e.tx === tx));
      const first = rx.asPromise.first<t.WebRuntimeNetbusResEvent>(res$, { op, timeout });

      bus.fire({
        type: 'sys.runtime.web/netbus:req',
        payload: { tx, id },
      });

      const res = await first;
      if (res.payload) return res.payload;

      const error = res.error?.message ?? 'Failed';
      return { tx, id, exists: false, error };
    },
  };

  return { $, id, is, dispose, dispose$, info, useModule, netbus };
}

/**
 * Event matching.
 */
const matcher = (startsWith: string) => (input: any) => rx.isEvent(input, { startsWith });
BusEvents.is = {
  base: matcher('sys.runtime.web/'),
  instance: (e: t.Event, id: InstanceId) => BusEvents.is.base(e) && e.payload?.id === id,
};
