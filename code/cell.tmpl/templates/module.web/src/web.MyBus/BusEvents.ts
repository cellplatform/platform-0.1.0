import { filter, takeUntil } from 'rxjs/operators';

import { DEFAULT, rx, slug, t } from './common';

type InstanceId = string;

/**
 * Event API for the "WebRuntime"
 */
export function BusEvents(args: {
  bus: t.EventBus<any>;
  id?: InstanceId;
  filter?: (e: t.MyEvent) => boolean;
}): t.WebRuntimeEvents {
  const { dispose, dispose$ } = rx.disposable();
  const id = args.id ?? DEFAULT.id;
  const bus = rx.busAsType<t.MyEvent>(args.bus);
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
    req$: rx.payload<t.MyInfoReqEvent>($, 'my.namespace/info:req'),
    res$: rx.payload<t.MyInfoResEvent>($, 'my.namespace/info:res'),
    async get(options = {}) {
      const { timeout = 30000 } = options;
      const tx = slug();

      const op = 'info';
      const res$ = info.res$.pipe(filter((e) => e.tx === tx));
      const first = rx.asPromise.first<t.MyInfoResEvent>(res$, { op, timeout });

      bus.fire({
        type: 'my.namespace/info:req',
        payload: { tx, id },
      });

      const res = await first;
      if (res.payload) return res.payload;

      const error = res.error?.message ?? 'Failed';
      return { tx, id, error };
    },
  };

  return { $, id, is, dispose, dispose$, info };
}

/**
 * Event matching.
 */
const matcher = (startsWith: string) => (input: any) => rx.isEvent(input, { startsWith });
BusEvents.is = {
  base: matcher('my.namespace/'),
  instance: (e: t.Event, id: InstanceId) => BusEvents.is.base(e) && e.payload?.id === id,
};
