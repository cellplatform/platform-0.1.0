import { firstValueFrom, of, timeout } from 'rxjs';
import { catchError, filter } from 'rxjs/operators';

import { CellAddress, rx, slug, t, timeoutWrangler } from './common';

type Milliseconds = number;
type CellUriAddress = string;
type FilesystemId = string;

/**
 * Events for working with remote cells.
 */
export function BusEventsCell(args: {
  id: FilesystemId;
  $: t.Observable<t.SysFsEvent>;
  bus: t.EventBus<t.SysFsEvent>;
  timeout: Milliseconds;
}): t.SysFsEventsRemote {
  const { id, $, bus } = args;
  const toTimeout = timeoutWrangler(args.timeout);

  /**
   * Push files to remote cell.
   */
  const push: t.SysFsEventsRemote['push'] = {
    req$: rx.payload<t.SysFsCellPushReqEvent>($, 'sys.fs/cell/push:req'),
    res$: rx.payload<t.SysFsCellPushResEvent>($, 'sys.fs/cell/push:res'),
    async fire(address: CellUriAddress, path, options = {}) {
      const tx = slug();
      const msecs = toTimeout(options);
      const first = firstValueFrom(
        push.res$.pipe(
          filter((e) => e.tx === tx),
          timeout(msecs),
          catchError(() => of(`[SysFs.Cell.Push] request timed out after ${msecs} msecs`)),
        ),
      );

      bus.fire({
        type: 'sys.fs/cell/push:req',
        payload: { tx, id, address, path: path ?? '' },
      });

      const res = await first;
      if (typeof res !== 'string') return res;

      const error: t.SysFsError = { code: 'client/timeout', message: res };
      const fail: t.SysFsCellPushRes = { ok: false, tx, id, files: [], errors: [error] };
      return fail;
    },
  };

  /**
   * Pull files from remote cell.
   */
  const pull: t.SysFsEventsRemote['pull'] = {
    req$: rx.payload<t.SysFsCellPullReqEvent>($, 'sys.fs/cell/pull:req'),
    res$: rx.payload<t.SysFsCellPullResEvent>($, 'sys.fs/cell/pull:res'),
    async fire(address: CellUriAddress, path, options = {}) {
      const tx = slug();
      const msecs = toTimeout(options);
      const first = firstValueFrom(
        pull.res$.pipe(
          filter((e) => e.tx === tx),
          timeout(msecs),
          catchError(() => of(`[SysFs.Cell.Pull] request timed out after ${msecs} msecs`)),
        ),
      );

      bus.fire({
        type: 'sys.fs/cell/pull:req',
        payload: { tx, id, address, path },
      });

      const res = await first;
      if (typeof res !== 'string') return res;

      const error: t.SysFsError = { code: 'client/timeout', message: res };
      const fail: t.SysFsCellPullRes = { ok: false, tx, id, files: [], errors: [error] };
      return fail;
    },
  };

  /**
   * Remote cell API.
   */

  const cell = (uri: CellUriAddress) => {
    const parsed = CellAddress.parse(uri);
    if (parsed.error) throw new Error(parsed.error);

    const api: t.SysFsEventsCell = {
      domain: parsed.domain,
      uri: parsed.uri,
      push: (path, options) => push.fire(uri, path, options),
      pull: (path, options) => pull.fire(uri, path, options),
    };

    return api;
  };

  const factory = (...args: string[]) => {
    const parts = args.map((arg) => (typeof arg === 'string' ? arg : ''));
    if (parts.length < 1) throw new Error(`Cell address not provided ("<domain>/<cell:uri>")`);
    if (parts.length === 1) return cell(parts[0]);
    const address = CellAddress.create(parts[0], parts[1]);
    if (address.error) throw new Error(address.error);
    return cell(address.toString());
  };

  /**
   * API
   */
  return { push, pull, cell: factory };
}
