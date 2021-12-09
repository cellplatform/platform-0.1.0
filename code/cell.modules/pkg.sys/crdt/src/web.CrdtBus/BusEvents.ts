import { filter, takeUntil } from 'rxjs/operators';

import { DEFAULT, rx, slug, t } from './common';

type InstanceId = string;

/**
 * Event API for the "WebRuntime"
 */
export function BusEvents(args: {
  bus: t.EventBus<any>;
  id?: InstanceId;
  filter?: (e: t.CrdtEvent) => boolean;
}): t.CrdtEvents {
  const { dispose, dispose$ } = rx.disposable();
  const id = args.id ?? DEFAULT.id;
  const bus = rx.busAsType<t.CrdtEvent>(args.bus);
  const is = BusEvents.is;

  const $ = bus.$.pipe(
    takeUntil(dispose$),
    filter((e) => is.instance(e, id)),
    filter((e) => args.filter?.(e) ?? true),
  );

  /**
   * Base information about the module.
   */
  const info: t.CrdtEvents['info'] = {
    req$: rx.payload<t.CrdtInfoReqEvent>($, 'sys.crdt/info:req'),
    res$: rx.payload<t.CrdtInfoResEvent>($, 'sys.crdt/info:res'),
    async get(options = {}) {
      const { timeout = 3000 } = options;
      const tx = slug();
      const op = 'info';
      const res$ = info.res$.pipe(filter((e) => e.tx === tx));
      const first = rx.asPromise.first<t.CrdtInfoResEvent>(res$, { op, timeout });

      bus.fire({
        type: 'sys.crdt/info:req',
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
  base: matcher('sys.crdt/'),
  instance: (e: t.Event, id: InstanceId) => BusEvents.is.base(e) && e.payload?.id === id,
};
