import { shell } from 'electron';
import { Subject } from 'rxjs';
import { share, take } from 'rxjs/operators';

import { FileDb, fs, NeDb, parseDbPath, t } from './common';

/**
 * Start the HyperDB IPC handler's listening on the [main] process.
 */
export function listen(args: { ipc: t.IpcClient; log: t.ILog }) {
  const ipc = args.ipc as t.DbIpc;
  const log = args.log;
  const events$ = new Subject<t.IDbIpcDbFired>();

  log.info(`listening for ${log.yellow('db events')}`);

  /**
   * Database client cache.
   */
  const CACHE: { [path: string]: t.IDb } = {};
  const factory = (conn: string) => {
    const { path, kind } = parseDbPath(conn);

    if (!CACHE[path]) {
      // Construct the database.
      let db: t.IDb;
      if (kind === 'FSDB') {
        db = FileDb.create({ dir: path, cache: false });
      } else if (kind === 'NEDB') {
        db = NeDb.create({ filename: path });
      } else {
        throw new Error(`DB of kind '${kind}' not supported.`);
      }
      CACHE[path] = db;

      // Monitor events.
      db.dispose$.pipe(take(1)).subscribe(() => delete CACHE[path]);
      db.events$.subscribe(event => events$.next({ conn, event }));
      log.info.gray(`${log.green(kind)}: ${path}`);
    }
    return CACHE[path];
  };

  /**
   * Broadcast all DB events to renderers.
   */
  events$.subscribe(payload => {
    // console.log('payload', payload);
    ipc.send('DB/fired', payload);
  });

  /**
   * GET
   */
  ipc.handle<t.IDbIpcGetEvent, t.IDbIpcGetResponse>('DB/get', async e => {
    try {
      const db = factory(e.payload.conn);
      const values = await db.getMany(e.payload.keys);
      return { values };
    } catch (error) {
      log.error(`[db:error/get] ${error.message}`);
      throw error;
    }
  });

  ipc.handle<t.IDbIpcFindEvent, t.IDbIpcFindResponse>('DB/find', async e => {
    try {
      const db = factory(e.payload.conn);
      const result = await db.find(e.payload.query);
      return { result };
    } catch (error) {
      log.error(`[db:error/find] ${error.message}`);
      throw error;
    }
  });

  /**
   * PUT
   */
  ipc.handle<t.IDbIpcPutEvent, t.IDbIpcPutResponse>('DB/put', async e => {
    try {
      const db = factory(e.payload.conn);
      const values = await db.putMany(e.payload.items);
      return { values };
    } catch (error) {
      log.error(`[db:error/put] ${error.message}`);
      throw error;
    }
  });

  /**
   * DELETE
   */
  ipc.handle<t.IDbIpcDeleteEvent, t.IDbIpcDeleteResponse>('DB/delete', async e => {
    try {
      const db = factory(e.payload.conn);
      const values = await db.deleteMany(e.payload.keys);
      return { values };
    } catch (error) {
      log.error(`[db:error/delete]: ${error.message}`);
      throw error;
    }
  });

  /**
   * Open folder.
   */
  ipc.on<t.IDbIpcOpenFolderEvent>('DB/open/folder').subscribe(async e => {
    let dir = fs.resolve(parseDbPath(e.payload.conn).path);
    dir = (await fs.is.dir(dir)) ? dir : fs.dirname(dir);
    shell.openItem(dir);
  });

  // Finish up.
  return {
    events$: events$.pipe(share()),
    factory,
  };
}
