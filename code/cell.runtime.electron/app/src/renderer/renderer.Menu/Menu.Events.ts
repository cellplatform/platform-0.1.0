import { firstValueFrom, of } from 'rxjs';
import { filter, takeUntil, timeout, catchError } from 'rxjs/operators';

import { rx, slug, t } from '../common';

/**
 * Event API.
 */
export function Events(args: { bus: t.EventBus<any> }): t.MenuEvents {
  const { dispose, dispose$ } = rx.disposable();
  const bus = rx.busAsType<t.MenuEvent>(args.bus);
  const is = Events.is;

  const $ = bus.$.pipe(
    takeUntil(dispose$),
    filter((e) => is.base(e)),
  );

  const status: t.MenuEvents['status'] = {
    req$: rx.payload<t.MenuStatusReqEvent>($, 'runtime.electron/Menu/status:req'),
    res$: rx.payload<t.MenuStatusResEvent>($, 'runtime.electron/Menu/status:res'),
    async get(options = {}) {
      const { timeout: msecs = 1000 } = options;

      const tx = slug();
      const first = firstValueFrom(
        status.res$.pipe(
          filter((e) => e.tx === tx),
          timeout(msecs),
          catchError(() => of(`Menu status request timed out after ${msecs} msecs`)),
        ),
      );

      bus.fire({
        type: 'runtime.electron/Menu/status:req',
        payload: { tx },
      });

      const res = await first;
      return typeof res === 'string' ? { tx, menu: [], error: res } : res;
    },
  };

  const load: t.MenuEvents['load'] = {
    req$: rx.payload<t.MenuLoadReqEvent>($, 'runtime.electron/Menu/load:req'),
    res$: rx.payload<t.MenuLoadResEvent>($, 'runtime.electron/Menu/load:res'),
    async fire(menu, options = {}) {
      const { timeout: msecs = 1000 } = options;
      const tx = slug();

      const first = firstValueFrom(
        load.res$.pipe(
          filter((e) => e.tx === tx),
          timeout(msecs),
          catchError(() => of(`Menu load timed out after ${msecs} msecs`)),
        ),
      );

      bus.fire({
        type: 'runtime.electron/Menu/load:req',
        payload: { tx, menu },
      });

      const res = await first;
      return typeof res === 'string' ? { tx, menu: [], error: res, elapsed: msecs } : res;
    },
  };

  const clicked: t.MenuEvents['clicked'] = {
    $: rx.payload<t.MenuItemClickedEvent>($, 'runtime.electron/Menu/clicked'),
    fire(item: t.MenuItem, parent?: t.MenuItem) {
      const { id = '' } = item;
      bus.fire({
        type: 'runtime.electron/Menu/clicked',
        payload: { id, item, parent },
      });
    },
  };

  return { $, is, dispose, dispose$, status, load, clicked };
}

/**
 * Event matching.
 */
const matcher = (startsWith: string) => (input: any) => rx.isEvent(input, { startsWith });
Events.is = {
  base: matcher('runtime.electron/Menu/'),
};
