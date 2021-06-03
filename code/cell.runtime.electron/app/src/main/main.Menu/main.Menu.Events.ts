import { firstValueFrom } from 'rxjs';
import { filter, takeUntil } from 'rxjs/operators';

import { rx, slug, t } from '../common';

/**
 * Event API.
 */
export function Events(args: { bus: t.EventBus<any> }) {
  const { dispose, dispose$ } = rx.disposable();
  const bus = rx.busAsType<t.MenuEvent>(args.bus);

  const is = {
    base: (input: any) => rx.isEvent(input, { startsWith: 'runtime.electron/Menu/' }),
  };

  const $ = bus.$.pipe(
    takeUntil(dispose$),
    filter((e) => is.base(e)),
  );

  const status = {
    req$: rx.payload<t.MenuStatusReqEvent>($, 'runtime.electron/Menu/status:req'),
    res$: rx.payload<t.MenuStatusResEvent>($, 'runtime.electron/Menu/status:res'),
    get() {
      const tx = slug();
      const res = firstValueFrom(status.res$.pipe(filter((e) => e.tx === tx)));
      bus.fire({ type: 'runtime.electron/Menu/status:req', payload: { tx } });
      return res;
    },
  };

  const load = {
    req$: rx.payload<t.MenuLoadReqEvent>($, 'runtime.electron/Menu/load:req'),
    res$: rx.payload<t.MenuLoadResEvent>($, 'runtime.electron/Menu/load:res'),
    fire(menu: t.MenuItem[]) {
      const tx = slug();
      const res = firstValueFrom(load.res$.pipe(filter((e) => e.tx === tx)));
      bus.fire({
        type: 'runtime.electron/Menu/load:req',
        payload: { tx, menu },
      });
      return res;
    },
  };

  const clicked = {
    $: rx.payload<t.MenuItemClickedEvent>($, 'runtime.eleectron/Menu/clicked'),
    fire(item: t.MenuItem, parent?: t.MenuItem) {
      const { id = '' } = item;
      bus.fire({
        type: 'runtime.eleectron/Menu/clicked',
        payload: { id, item, parent },
      });
    },
  };

  return { $, is, dispose, dispose$, status, load, clicked };
}
