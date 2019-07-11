import { Subject } from 'rxjs';
import { take } from 'rxjs/operators';

import { FileDb, t } from './common';

/**
 * Start the HyperDB IPC handler's listening on the [main] process.
 */
export function listen(args: { ipc: t.IpcClient; log: t.ILog }) {
  const ipc = args.ipc as t.DbIpc;
  const log = args.log;
  const events$ = new Subject<t.IDbIpcDbFired>();

  log.info(`listening for ${log.yellow('db events')}`);

  const CACHE: { [dir: string]: t.IDb } = {};
  const factory = (dir: string) => {
    if (!CACHE[dir]) {
      const db = (CACHE[dir] = FileDb.create({ dir, cache: false }));
      db.dispose$.pipe(take(1)).subscribe(() => delete CACHE[dir]);
      db.events$.subscribe(event => events$.next({ dir, event }));
      log.info.gray(`${log.yellow('cached file-database')}: ${dir}`);
    }
    return CACHE[dir];
  };

  /**
   * Broadcast all DB events to renderers.
   */
  events$.subscribe(payload => {
    ipc.send('DB/fired', payload);
  });

  /**
   * GET
   */
  ipc.handle<t.IDbIpcGetEvent, t.IDbIpcGetResponse>('DB/get', async e => {
    const db = factory(e.payload.dir);
    const values = await db.getMany(e.payload.keys);
    return { values };
  });

  ipc.handle<t.IDbIpcFindEvent, t.IDbIpcFindResponse>('DB/find', async e => {
    const db = factory(e.payload.dir);
    const result = await db.find(e.payload.query);
    return { result };
  });

  /**
   * PUT
   */
  ipc.handle<t.IDbIpcPutEvent, t.IDbIpcPutResponse>('DB/put', async e => {
    const db = factory(e.payload.dir);
    const values = await db.putMany(e.payload.items);
    return { values };
  });

  /**
   * DELETE
   */
  ipc.handle<t.IDbIpcDeleteEvent, t.IDbIpcDeleteResponse>('DB/delete', async e => {
    const db = factory(e.payload.dir);
    const values = await db.deleteMany(e.payload.keys);
    return { values };
  });
}
