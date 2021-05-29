import { firstValueFrom } from 'rxjs';
import { filter, takeUntil } from 'rxjs/operators';

import { RuntimeUri, rx, slug, t } from '../common';

/**
 * Event API for working with Electron windows.
 */
export function WindowEvents(args: { bus: t.EventBus<any> }) {
  const { dispose$, dispose } = rx.disposable();
  const bus = rx.busAsType<t.WindowEvent>(args.bus);
  const $ = bus.$.pipe(takeUntil(dispose$));

  /**
   * Events that create a window.
   */
  const create = {
    req$: rx.payload<t.ElectronWindowCreateReqEvent>($, 'runtime.electron/window/create:req'),
    res$: rx.payload<t.WindowCreateResEvent>($, 'runtime.electron/window/create:res'),
    fire(args: {
      url: string;
      devTools?: t.ElectronWindowCreateReq['devTools'];
      props?: t.ElectronWindowCreateReq['props'];
    }) {
      const { url, devTools, props = {} } = args;
      const tx = slug();
      const res = firstValueFrom(create.res$.pipe(filter((e) => e.tx === tx)));
      bus.fire({
        type: 'runtime.electron/window/create:req',
        payload: { tx, url, devTools, props },
      });
      return res;
    },
  };

  /**
   * Window status
   */
  const status = {
    req$: rx.payload<t.WindowsStatusReqEvent>($, 'runtime.electron/windows/status:req'),
    res$: rx.payload<t.WindowsStatusResEvent>($, 'runtime.electron/windows/status:res'),
    async get() {
      const tx = slug();
      const res = firstValueFrom(status.res$.pipe(filter((e) => e.tx === tx)));
      bus.fire({
        type: 'runtime.electron/windows/status:req',
        payload: { tx },
      });
      const { windows } = await res;
      return { windows };
    },
  };

  /**
   * Change window state (eg, move, resize)
   */
  const change = {
    before$: rx.payload<t.WindowChangeEvent>($, 'runtime.electron/window/change'),
    after$: rx.payload<t.ElectronWindowChangedEvent>($, 'runtime.electron/window/changed'),
    fire(
      window: t.ElectronWindowIdParam,
      options: { bounds?: Partial<t.WindowBounds>; isVisible?: boolean } = {},
    ) {
      const { bounds, isVisible } = options;
      const uri = typeof window === 'string' ? window : RuntimeUri.window.create(window);
      bus.fire({
        type: 'runtime.electron/window/change',
        payload: { uri, bounds, isVisible },
      });
    },
  };

  return {
    dispose$,
    dispose,
    create,
    status,
    change,
  };
}
