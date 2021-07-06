import { firstValueFrom, of } from 'rxjs';
import { filter, takeUntil, timeout, catchError } from 'rxjs/operators';
import { rx, slug, t } from '../common';

type Uri = string;

/**
 * Event API.
 */
export function Events(args: { bus: t.EventBus<any> }): t.BundleEvents {
  const { dispose, dispose$ } = rx.disposable();
  const bus = rx.busAsType<t.BundleEvent>(args.bus);
  const is = Events.is;

  const $ = bus.$.pipe(
    takeUntil(dispose$),
    filter((e) => is.base(e)),
  );

  const list: t.BundleEvents['list'] = {
    req$: rx.payload<t.BundleListReqEvent>($, 'runtime.electron/Bundle/list:req'),
    res$: rx.payload<t.BundleListResEvent>($, 'runtime.electron/Bundle/list:res'),
    async get(options = {}) {
      const { domain } = options;
      const tx = slug();
      const msecs = options.timeout ?? 1000;
      const first = firstValueFrom(
        list.res$.pipe(
          filter((e) => e.tx === tx),
          timeout(msecs),
          catchError(() => of(`Bundle listing timed out after ${msecs} msecs`)),
        ),
      );

      bus.fire({
        type: 'runtime.electron/Bundle/list:req',
        payload: { tx, domain },
      });

      const res = await first;
      return typeof res === 'string' ? { items: [], error: res } : res;
    },
  };

  const install: t.BundleEvents['install'] = {
    req$: rx.payload<t.BundleInstallReqEvent>($, 'runtime.electron/Bundle/install:req'),
    res$: rx.payload<t.BundleInstallResEvent>($, 'runtime.electron/Bundle/install:res'),
    async fire(source, options = {}) {
      const tx = slug();
      const { force, timeout: msecs = 3000 } = options;
      const first = firstValueFrom(
        install.res$.pipe(
          filter((e) => e.tx === tx),
          timeout(msecs),
          catchError(() => of(`Installation timed out after ${msecs} msecs`)),
        ),
      );

      bus.fire({
        type: 'runtime.electron/Bundle/install:req',
        payload: { tx, source, force },
      });

      const res = await first;
      return typeof res === 'string'
        ? { tx, ok: false, action: 'error', source, errors: [res], elapsed: -1 }
        : res;
    },
  };

  const status: t.BundleEvents['status'] = {
    req$: rx.payload<t.BundleStatusReqEvent>($, 'runtime.electron/Bundle/status:req'),
    res$: rx.payload<t.BundleStatusResEvent>($, 'runtime.electron/Bundle/status:res'),
    async get(args: { dir: string; cell: Uri | t.ICellUri }) {
      const { dir } = args;
      const cell = typeof args.cell === 'object' ? args.cell.toString() : args.cell;
      const tx = slug();
      const res = firstValueFrom(status.res$.pipe(filter((e) => e.tx === tx)));
      bus.fire({
        type: 'runtime.electron/Bundle/status:req',
        payload: { tx, dir, cell },
      });
      return (await res).status;
    },
  };

  const fs: t.BundleEvents['fs'] = {
    save: {
      req$: rx.payload<t.BundleFsSaveReqEvent>($, 'runtime.electron/Bundle/fs/save:req'),
      res$: rx.payload<t.BundleFsSaveResEvent>($, 'runtime.electron/Bundle/fs/save:res'),
      fire(args) {
        const { source, target, force, silent } = args;
        const tx = slug();
        const res = firstValueFrom(fs.save.res$.pipe(filter((e) => e.tx === tx)));
        bus.fire({
          type: 'runtime.electron/Bundle/fs/save:req',
          payload: { tx, source, target, force, silent },
        });
        return res;
      },
    },
  };

  return { $, is, dispose, dispose$, list, install, status, fs };
}

/**
 * Event matching.
 */
const matcher = (startsWith: string) => (input: any) => rx.isEvent(input, { startsWith });
Events.is = {
  base: matcher('runtime.electron/Bundle/'),
};
