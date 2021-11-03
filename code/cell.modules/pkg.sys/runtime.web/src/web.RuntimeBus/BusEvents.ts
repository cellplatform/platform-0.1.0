import { firstValueFrom, of, timeout } from 'rxjs';
import { catchError, filter, takeUntil } from 'rxjs/operators';
import { t, rx, DEFAULT, slug } from './common';

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
      const { timeout: msecs = 90000 } = options;
      const tx = slug();

      const first = firstValueFrom(
        info.res$.pipe(
          filter((e) => e.tx === tx),
          timeout(msecs),
          catchError(() => of(`ModuleInfo request timed out after ${msecs} msecs`)),
        ),
      );

      bus.fire({
        type: 'sys.runtime.web/info:req',
        payload: { tx, id },
      });

      const res = await first;
      return typeof res === 'string' ? { tx, id, exists: false, error: res } : res;
    },
  };

  /**
   * Use remote module
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

  return { $, id, is, dispose, dispose$, info, useModule };
}

/**
 * Event matching.
 */
const matcher = (startsWith: string) => (input: any) => rx.isEvent(input, { startsWith });
BusEvents.is = {
  base: matcher('sys.runtime.web/'),
  instance: (e: t.Event, id: InstanceId) => BusEvents.is.base(e) && e.payload?.id === id,
};
