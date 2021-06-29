import { firstValueFrom } from 'rxjs';
import { takeUntil, filter } from 'rxjs/operators';
import { t, rx, slug } from '../common';

/**
 * Event API.
 */
export function Events(args: { bus: t.EventBus<any> }) {
  const { dispose, dispose$ } = rx.disposable();
  const bus = rx.busAsType<t.SystemEvent>(args.bus);
  const is = Events.is;

  const $ = bus.$.pipe(
    takeUntil(dispose$),
    filter((e) => is.base(e)),
  );

  const status = {
    req$: rx.payload<t.SystemStatusReqEvent>($, 'runtime.electron/System/status:req'),
    res$: rx.payload<t.SystemStatusResEvent>($, 'runtime.electron/System/status:res'),
    async get() {
      const tx = slug();
      const res = firstValueFrom(status.res$.pipe(filter((e) => e.tx === tx)));
      bus.fire({ type: 'runtime.electron/System/status:req', payload: { tx } });
      return (await res).status;
    },
  };

  const open = {
    path: {
      $: rx.payload<t.SystemOpenPathEvent>($, 'runtime.electron/System/open/path'),
      fire(path: string) {
        bus.fire({ type: 'runtime.electron/System/open/path', payload: { path } });
      },
    },
  };

  const data = {
    snapshot: {
      $: rx.payload<t.SystemDataSnapshotEvent>($, 'runtime.electron/System/data/snapshot'),
      fire(payload: t.SystemDataSnapshot = {}) {
        bus.fire({ type: 'runtime.electron/System/data/snapshot', payload });
      },
    },
    reset: {
      $: rx.payload<t.SystemDataResetEvent>($, 'runtime.electron/System/data/reset'),
      fire(payload: t.SystemDataReset = {}) {
        bus.fire({ type: 'runtime.electron/System/data/reset', payload });
      },
    },
  };

  return { $, is, dispose, dispose$, status, open, data };
}

/**
 * Event matching.
 */
const matcher = (startsWith: string) => (input: any) => rx.isEvent(input, { startsWith });
Events.is = {
  base: matcher('runtime.electron/System/'),
  data: matcher('runtime.electron/System/data/'),
  open: matcher('runtime.electron/System/open/'),
};
