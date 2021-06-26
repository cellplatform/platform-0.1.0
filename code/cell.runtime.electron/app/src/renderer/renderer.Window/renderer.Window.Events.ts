import { firstValueFrom } from 'rxjs';
import { filter, takeUntil } from 'rxjs/operators';

import { RuntimeUri, rx, slug, t } from '../common';

/**
 * Event API for working with Electron windows.
 */
export function Events(args: { bus: t.EventBus<any> }): t.WindowEvents {
  const { dispose$, dispose } = rx.disposable();
  const bus = rx.busAsType<t.WindowEvent>(args.bus);
  const is = Events.is;

  const $ = bus.$.pipe(
    takeUntil(dispose$),
    filter((e) => is.base(e)),
  );

  /**
   * Events that create a window.
   */
  const create = {
    req$: rx.payload<t.WindowCreateReqEvent>($, 'runtime.electron/Window/create:req'),
    res$: rx.payload<t.WindowCreateResEvent>($, 'runtime.electron/Window/create:res'),
    fire(args: {
      url: string;
      devTools?: t.WindowCreateReq['devTools'];
      props?: t.WindowCreateReq['props'];
    }) {
      const { url, devTools, props = {} } = args;
      const tx = slug();
      const res = firstValueFrom(create.res$.pipe(filter((e) => e.tx === tx)));
      bus.fire({
        type: 'runtime.electron/Window/create:req',
        payload: { tx, url, devTools, props },
      });
      return res;
    },
  };

  /**
   * Window status
   */
  const status = {
    req$: rx.payload<t.WindowStatusReqEvent>($, 'runtime.electron/Window/status:req'),
    res$: rx.payload<t.WindowsStatusResEvent>($, 'runtime.electron/Window/status:res'),
    async get() {
      const tx = slug();
      const res = firstValueFrom(status.res$.pipe(filter((e) => e.tx === tx)));
      bus.fire({
        type: 'runtime.electron/Window/status:req',
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
    before$: rx.payload<t.WindowChangeEvent>($, 'runtime.electron/Window/change'),
    after$: rx.payload<t.WindowChangedEvent>($, 'runtime.electron/Window/changed'),
    fire(
      window: t.WindowIdParam,
      options: { bounds?: Partial<t.WindowBounds>; isVisible?: boolean } = {},
    ) {
      const { bounds, isVisible } = options;
      const uri = typeof window === 'string' ? window : RuntimeUri.window.create(window);
      bus.fire({
        type: 'runtime.electron/Window/change',
        payload: { uri, bounds, isVisible },
      });
    },
  };

  return { $, is, dispose$, dispose, create, status, change };
}

/**
 * Event matching.
 */
const matcher = (startsWith: string) => (input: any) => rx.isEvent(input, { startsWith });
Events.is = {
  base: matcher('runtime.electron/Window/'),
};
