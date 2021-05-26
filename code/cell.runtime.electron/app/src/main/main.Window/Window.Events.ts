import { firstValueFrom } from 'rxjs';
import { filter, takeUntil } from 'rxjs/operators';

import { rx, slug, t } from '../common';

/**
 * Event API for working with Electron windows.
 */
export function WindowEvents(args: { bus: t.EventBus<any> }) {
  const { dispose$, dispose } = rx.disposable();
  const bus = rx.busAsType<t.ElectronWindowEvent>(args.bus);
  const $ = bus.$.pipe(takeUntil(dispose$));

  /**
   * Events that create a window.
   */
  const create = {
    req$: rx.payload<t.ElectronWindowCreateReqEvent>($, 'runtime.electron/window/create:req'),
    res$: rx.payload<t.ElectronWindowCreateResEvent>($, 'runtime.electron/window/create:res'),
    fire(args: {
      url: string;
      showOnLoad?: boolean;
      devTools?: t.ElectronWindowCreateReq['devTools'];
      props?: t.ElectronWindowCreateReq['props'];
    }) {
      const { url, showOnLoad, devTools, props = {} } = args;
      const tx = slug();
      const res = firstValueFrom(create.res$.pipe(filter((e) => e.tx === tx)));
      bus.fire({
        type: 'runtime.electron/window/create:req',
        payload: { tx, url, showOnLoad, devTools, props },
      });
      return res;
    },
  };

  /**
   * Window status
   */
  const status = {
    req$: rx.payload<t.ElectronWindowsStatusReqEvent>($, 'runtime.electron/windows/status:req'),
    res$: rx.payload<t.ElectronWindowsStatusResEvent>($, 'runtime.electron/windows/status:res'),
    async get() {
      const tx = slug();
      const res = firstValueFrom(status.res$.pipe(filter((e) => e.tx === tx)));
      bus.fire({
        type: 'runtime.electron/windows/status:req',
        payload: { tx },
      });
      return (await res).windows;
    },
  };

  return {
    dispose$,
    dispose,
    create,
    status,
  };
}
