import { firstValueFrom } from 'rxjs';
import { filter, takeUntil } from 'rxjs/operators';

import { rx, slug, t } from '../common';

type Uri = string;

/**
 * Event API.
 */
export function Events(args: { bus: t.EventBus<any> }) {
  const { dispose, dispose$ } = rx.disposable();
  const bus = rx.busAsType<t.BundleEvent>(args.bus);

  const is = {
    base: (input: any) => rx.isEvent(input, { startsWith: 'runtime.electron/Bundle/' }),
  };

  const $ = bus.$.pipe(
    takeUntil(dispose$),
    filter((e) => is.base(e)),
  );

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

  return { $, is, dispose, dispose$, status, upload };
}
