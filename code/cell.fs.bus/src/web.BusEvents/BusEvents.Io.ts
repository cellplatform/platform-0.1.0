import { firstValueFrom, of, timeout } from 'rxjs';
import { catchError, filter } from 'rxjs/operators';

import { rx, slug, t, timeoutWrangler } from './common';

type FilesystemId = string;

/**
 * Primitive IO events (read,write,copy,delete).
 */
export function BusEventsIo(args: {
  id: FilesystemId;
  $: t.Observable<t.SysFsEvent>;
  bus: t.EventBus<t.SysFsEvent>;
  timeout: number;
}): t.SysFsEventsIo {
  const { id, $, bus } = args;
  const toTimeout = timeoutWrangler(args.timeout);

  /**
   * File/system information.
   */
  const info: t.SysFsEventsIo['info'] = {
    req$: rx.payload<t.SysFsInfoReqEvent>($, 'sys.fs/info:req'),
    res$: rx.payload<t.SysFsInfoResEvent>($, 'sys.fs/info:res'),
    async get(options = {}) {
      const { path } = options;
      const msecs = toTimeout(options);
      const tx = slug();

      const first = firstValueFrom(
        info.res$.pipe(
          filter((e) => e.tx === tx),
          timeout(msecs),
          catchError(() => of(`[SysFs.Info] request timed out after ${msecs} msecs`)),
        ),
      );

      bus.fire({
        type: 'sys.fs/info:req',
        payload: { tx, id, path },
      });

      const res = await first;
      if (typeof res !== 'string') return res;

      const error: t.SysFsError = { code: 'client/timeout', message: res };
      const fail: t.SysFsInfoRes = { tx, id, paths: [], error };
      return fail;
    },
  };

  /**
   * Read
   */
  const read: t.SysFsEventsIo['read'] = {
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

      bus.fire({
        type: 'sys.fs/read:req',
        payload: { tx, id, path },
      });
      const res = await first;

      if (typeof res !== 'string') {
        const { files, error } = res;
        return { files, error };
      }

      const error: t.SysFsError = { code: 'client/timeout', message: res };
      const fail: t.SysFsReadResponse = { files: [], error };
      return fail;
    },
  };

  /**
   * Write
   */
  const write: t.SysFsEventsIo['write'] = {
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

      bus.fire({
        type: 'sys.fs/write:req',
        payload: { tx, id, file },
      });
      const res = await first;

      if (typeof res !== 'string') {
        const { files, error } = res;
        return { files, error };
      }

      const error: t.SysFsError = { code: 'client/timeout', message: res };
      const fail: t.SysFsWriteResponse = { files: [], error };
      return fail;
    },
  };

  /**
   * Copy
   */
  const copy: t.SysFsEventsIo['copy'] = {
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

      bus.fire({
        type: 'sys.fs/copy:req',
        payload: { tx, id, file },
      });
      const res = await first;

      if (typeof res !== 'string') {
        const { files, error } = res;
        return { files, error };
      }

      const error: t.SysFsError = { code: 'client/timeout', message: res };
      const fail: t.SysFsCopyResponse = { files: [], error };
      return fail;
    },
  };

  /**
   * Move
   */
  const move: t.SysFsEventsIo['move'] = {
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

      bus.fire({
        type: 'sys.fs/move:req',
        payload: { tx, id, file },
      });
      const res = await first;

      if (typeof res !== 'string') {
        const { files, error } = res;
        return { files, error };
      }

      const error: t.SysFsError = { code: 'client/timeout', message: res };
      const fail: t.SysFsMoveResponse = { files: [], error };
      return fail;
    },
  };

  /**
   * Delete
   */
  const del: t.SysFsEventsIo['delete'] = {
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

      bus.fire({
        type: 'sys.fs/delete:req',
        payload: { tx, id, path },
      });
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
  return { info, read, write, copy, move, delete: del };
}
