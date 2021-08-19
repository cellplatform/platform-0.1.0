import { firstValueFrom, of, timeout } from 'rxjs';
import { catchError, filter } from 'rxjs/operators';

import { rx, slug, t, timeoutWrangler } from './common';

type FilesystemId = string;

/**
 * Events for indexing a file-system.
 */
export function IndexEvents(args: {
  id: FilesystemId;
  $: t.Observable<t.SysFsEvent>;
  bus: t.EventBus<t.SysFsEvent>;
  timeout: number;
}): t.SysFsEventsIndex {
  const { id, $, bus } = args;
  const toTimeout = timeoutWrangler(args.timeout);

  const manifest: t.SysFsEventsIndex['manifest'] = {
    req$: rx.payload<t.SysFsManifestReqEvent>($, 'sys.fs/manifest:req'),
    res$: rx.payload<t.SysFsManifestResEvent>($, 'sys.fs/manifest:res'),

    async get(options = {}) {
      const { dir, cache } = options;
      const msecs = toTimeout(options);
      const tx = slug();

      const first = firstValueFrom(
        manifest.res$.pipe(
          filter((e) => e.tx === tx),
          timeout(msecs),
          catchError(() => of(`[SysFs.Index.Manifest] request timed out after ${msecs} msecs`)),
        ),
      );

      bus.fire({
        type: 'sys.fs/manifest:req',
        payload: { tx, id, dir, cache },
      });

      const res = await first;
      if (typeof res !== 'string') return res;

      const error: t.SysFsError = { code: 'client/timeout', message: res };
      const fail: t.SysFsManifestRes = { tx, id, dirs: [], error };
      return fail;
    },
  };

  return { manifest };
}
