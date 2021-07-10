import { firstValueFrom, of } from 'rxjs';
import { filter, takeUntil, timeout, catchError } from 'rxjs/operators';
import { rx, slug, t } from '../common';

/**
 * Event API.
 */
export function Events(args: { bus: t.EventBus<any> }): t.FilesystemEvents {
  const { dispose, dispose$ } = rx.disposable();
  const bus = rx.busAsType<t.FilesystemEvent>(args.bus);
  const is = Events.is;

  const $ = bus.$.pipe(
    takeUntil(dispose$),
    filter((e) => is.base(e)),
  );

  const write: t.FilesystemEvents['write'] = {
    req$: rx.payload<t.FilesystemWriteReqEvent>($, 'runtime.electron/Filesystem/write:req'),
    res$: rx.payload<t.FilesystemWriteResEvent>($, 'runtime.electron/Filesystem/write:res'),
    async fire(args) {
      const { source, target, force, silent, timeout: msecs = 3000 } = args;
      const tx = slug();

      const first = firstValueFrom(
        write.res$.pipe(
          filter((e) => e.tx === tx),
          timeout(msecs),
          catchError(() => of(`Filesystem save ("upload") timed out after ${msecs} msecs`)),
        ),
      );

      bus.fire({
        type: 'runtime.electron/Filesystem/write:req',
        payload: { tx, source, target, force, silent },
      });

      const res = await first;
      if (typeof res !== 'string') return res; // Success.

      // Failure.
      return {
        tx,
        ok: false,
        action: 'error',
        elapsed: msecs,
        source,
        target: { ...target, host: target.host || '' },
        files: [],
        errors: [res],
      };
    },
  };

  return { $, is, dispose, dispose$, write };
}

/**
 * Event matching.
 */
const matcher = (startsWith: string) => (input: any) => rx.isEvent(input, { startsWith });
Events.is = {
  base: matcher('runtime.electron/Filesystem/'),
};
