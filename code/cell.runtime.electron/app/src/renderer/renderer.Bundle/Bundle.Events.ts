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
    async get(args = {}) {
      const msecs = args.timeout ?? 1000;
      const tx = slug();
      const first = firstValueFrom(
        list.res$.pipe(
          filter((e) => e.tx === tx),
          timeout(msecs),
          catchError(() => of(`Bundle listing timed out after ${msecs} msecs`)),
        ),
      );
      bus.fire({
        type: 'runtime.electron/Bundle/list:req',
        payload: { tx },
      });
      const res = await first;
      return typeof res === 'string' ? { items: [], error: res } : { items: res.items };
    },
  };

  const status = {
    req$: rx.payload<t.BundleStatusReqEvent>($, 'runtime.electron/Bundle/status:req'),
    res$: rx.payload<t.BundleStatusResEvent>($, 'runtime.electron/Bundle/status:res'),
    async get(args: { dir: string; cell?: Uri | t.ICellUri }) {
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

  const upload = {
    req$: rx.payload<t.BundleUploadReqEvent>($, 'runtime.electron/Bundle/upload:req'),
    res$: rx.payload<t.BundleUploadResEvent>($, 'runtime.electron/Bundle/upload:res'),
    fire(args: { sourceDir: string; targetDir: string; force?: boolean }) {
      const { sourceDir, targetDir, force } = args;
      const tx = slug();
      const res = firstValueFrom(upload.res$.pipe(filter((e) => e.tx === tx)));
      bus.fire({
        type: 'runtime.electron/Bundle/upload:req',
        payload: { tx, sourceDir, targetDir, force },
      });
      return res;
    },
  };

  return { $, is, dispose, dispose$, list, status, upload };
}

/**
 * Event matching.
 */
const matcher = (startsWith: string) => (input: any) => rx.isEvent(input, { startsWith });
Events.is = {
  base: matcher('runtime.electron/Bundle/'),
};
