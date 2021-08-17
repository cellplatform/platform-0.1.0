import { firstValueFrom, of, timeout } from 'rxjs';
import { catchError, filter } from 'rxjs/operators';

import { rx, slug, t, timeoutWrangler } from './common';

type FilesystemId = string;
type IO = t.SysFsEventsIo;

/**
 * Primitive IO events (read,write,copy,delete).
 */
export function IoEvents(args: {
  id: FilesystemId;
  $: t.Observable<t.SysFsEvent>;
  bus: t.EventBus<t.SysFsEvent>;
  timeout: number;
}): IO {
  const { id, $, bus } = args;
  const toTimeout = timeoutWrangler(args.timeout);

  const read: IO['read'] = {
    req$: rx.payload<t.SysFsReadReqEvent>($, 'sys.fs/read:req'),
    res$: rx.payload<t.SysFsReadResEvent>($, 'sys.fs/read:res'),
    async get(path, options = {}) {
      const msecs = toTimeout(options);
      const tx = slug();

      const first = firstValueFrom(
        read.res$.pipe(
          filter((e) => e.tx === tx),
          timeout(msecs),
          catchError(() => of(`[SysFs.Read] request timed out after ${msecs} msecs`)),
        ),
      );

      bus.fire({ type: 'sys.fs/read:req', payload: { tx, id, path } });
      const res = await first;

      if (typeof res === 'string')
        return { tx, id, files: [], error: { code: 'client/timeout', message: res } };

      const { files, error } = res;
      return { files, error };
    },
  };

  const write: IO['write'] = {
    req$: rx.payload<t.SysFsWriteReqEvent>($, 'sys.fs/write:req'),
    res$: rx.payload<t.SysFsWriteResEvent>($, 'sys.fs/write:res'),
    async fire(file, options = {}) {
      const msecs = toTimeout(options);
      const tx = slug();

      const first = firstValueFrom(
        write.res$.pipe(
          filter((e) => e.tx === tx),
          timeout(msecs),
          catchError(() => of(`[SysFs.Write] request timed out after ${msecs} msecs`)),
        ),
      );

      bus.fire({ type: 'sys.fs/write:req', payload: { tx, id, file } });
      const res = await first;

      if (typeof res === 'string')
        return { tx, id, files: [], error: { code: 'client/timeout', message: res } };

      const { files, error } = res;
      return { files, error };
    },
  };

  const copy: IO['copy'] = {
    req$: rx.payload<t.SysFsCopyReqEvent>($, 'sys.fs/copy:req'),
    res$: rx.payload<t.SysFsCopyResEvent>($, 'sys.fs/copy:res'),
    async fire(file, options = {}) {
      const msecs = toTimeout(options);
      const tx = slug();

      const first = firstValueFrom(
        copy.res$.pipe(
          filter((e) => e.tx === tx),
          timeout(msecs),
          catchError(() => of(`[SysFs.Copy] request timed out after ${msecs} msecs`)),
        ),
      );

      bus.fire({ type: 'sys.fs/copy:req', payload: { tx, id, file } });
      const res = await first;

      if (typeof res === 'string')
        return { tx, id, files: [], error: { code: 'client/timeout', message: res } };

      const { files, error } = res;
      return { files, error };
    },
  };

  const move: IO['move'] = {
    req$: rx.payload<t.SysFsMoveReqEvent>($, 'sys.fs/move:req'),
    res$: rx.payload<t.SysFsMoveResEvent>($, 'sys.fs/move:res'),
    async fire(file, options = {}) {
      const msecs = toTimeout(options);
      const tx = slug();

      const first = firstValueFrom(
        move.res$.pipe(
          filter((e) => e.tx === tx),
          timeout(msecs),
          catchError(() => of(`[SysFs.Move] request timed out after ${msecs} msecs`)),
        ),
      );

      bus.fire({ type: 'sys.fs/move:req', payload: { tx, id, file } });
      const res = await first;

      if (typeof res === 'string')
        return { tx, id, files: [], error: { code: 'client/timeout', message: res } };

      const { files, error } = res;
      return { files, error };
    },
  };

  const del: IO['delete'] = {
    req$: rx.payload<t.SysFsDeleteReqEvent>($, 'sys.fs/delete:req'),
    res$: rx.payload<t.SysFsDeleteResEvent>($, 'sys.fs/delete:res'),
    async fire(path, options = {}) {
      const msecs = toTimeout(options);
      const tx = slug();

      const first = firstValueFrom(
        del.res$.pipe(
          filter((e) => e.tx === tx),
          timeout(msecs),
          catchError(() => of(`[SysFs.Delete] request timed out after ${msecs} msecs`)),
        ),
      );

      bus.fire({ type: 'sys.fs/delete:req', payload: { tx, id, path } });
      const res = await first;

      if (typeof res === 'string')
        return { tx, id, files: [], error: { code: 'client/timeout', message: res } };

      const { files, error } = res;
      return { files, error };
    },
  };

  /**
   * API
   */
  return { read, write, copy, move, delete: del };
}
