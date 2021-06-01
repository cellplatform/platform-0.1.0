import { firstValueFrom } from 'rxjs';
import { filter, takeUntil } from 'rxjs/operators';

import { rx, slug, t } from '../common';

/**
 * Event API.
 */
export function Events(args: { bus: t.EventBus<any> }) {
  const { dispose, dispose$ } = rx.disposable();
  const bus = rx.busAsType<t.MenuEvent>(args.bus);
  const $ = bus.$.pipe(takeUntil(dispose$));

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

  return {
    dispose,
    dispose$,
    load,
  };
}
