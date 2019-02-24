import { fs } from '@platform/fs';
import { app } from 'electron';
import { Subject } from 'rxjs';
import { share } from 'rxjs/operators';

import { is, value } from '../common';
import { Db, Swarm } from '@platform/hyperdb';
import { create } from './main.create';
import * as t from './types';

type Ref = { db: Db; swarm: Swarm; path: string; version?: string };
type Refs = { [key: string]: Ref };
const refs: Refs = {};

/**
 * Start the HyperDB IPC handler's listening on the [main] process.
 */
export function listen(args: { ipc: t.IpcClient; log: t.ILog }) {
  const ipc = args.ipc as t.DbIpcRendererClient;
  const log = args.log;
  const events$ = new Subject<t.MainDbEvent>();

  const createDb = async (args: { dir: string; dbKey?: string; version?: string }) => {
    const { dir, dbKey, version } = args;

    // Construct the DB.
    const paths = {
      dev: dir,
      prod: fs.join(app.getPath('userData'), dir),
    };
    const path = is.prod ? paths.prod : paths.dev;
    const res = await create({ dir: path, dbKey, version });
    const { db, swarm } = res;

    // Ferry DB events to clients.
    db.events$.subscribe(e => ipc.send(e.type, e.payload));

    // Finish up.
    events$.next({
      type: 'DB/main/created',
      payload: {
        dir,
        dbKey: db.key,
        localKey: db.localKey,
        discoveryKey: db.discoveryKey,
        version,
      },
    });
    const ref: Ref = { db, swarm, path };
    logCreated(log, ref);
    return ref;
  };

  const getOrCreateDb = async (args: { dir: string; dbKey?: string; version?: string }) => {
    const { dir, version } = args;
    let refKey = dir;
    refKey = version ? `${refKey}/ver:${version}` : refKey;
    refs[refKey] = refs[refKey] || createDb(args);
    return refs[refKey];
  };

  /**
   * [HANDLE] state requests from DB `renderer` clients and
   * fire back the latest values.
   */
  ipc.handle<t.IDbGetStateEvent>('DB/state/get', async e => {
    type E = t.IDbUpdateStateEvent;
    type P = E['payload'];
    const { dir, dbKey, version } = e.payload.db;
    const { db } = await getOrCreateDb({ dir, dbKey, version });
    try {
      const { key, discoveryKey, localKey, watching, isDisposed } = db;
      const props: t.IDbProps = { key, discoveryKey, localKey, watching, isDisposed };
      const payload: P = { db: { dir }, props };
      ipc.send<E>('DB/state/update', payload);
    } catch (err) {
      const message = `Failed to get state fields of DB '${dir}'. ${err.message}`;
      log.error(message);
    }
  });

  /**
   * [HANDLE] invoke requests from DB `renderer` clients.
   */
  ipc.handle<t.IDbInvokeEvent, t.IDbInvokeResponse>('DB/invoke', async e => {
    const { method, params } = e.payload;
    const { dir, dbKey, version } = e.payload.db;
    const { db } = await getOrCreateDb({ dir, dbKey, version });
    try {
      const fn = db[method] as (...params: any[]) => any;
      const res = fn.apply(db, params);
      const result = value.isPromise(res) ? await res : res;
      return { method, result };
    } catch (err) {
      const message = err.message;
      const error = { message };
      return { method, error };
    }
  });

  /**
   * [HANDLE] requests to `disconnect` (leave the swarm).
   */
  ipc.handle<t.IDbConnectEvent>('DB/connect', async e => {
    const { dir, dbKey, version } = e.payload.db;
    const ref = await getOrCreateDb({ dir, dbKey, version });
    if (!ref.swarm.isActive) {
      await ref.swarm.join();
      logConnection(log, ref);
    }
  });

  /**
   * [HANDLE] requests to `connect` (leave the swarm).
   */
  ipc.handle<t.IDbDisconnectEvent>('DB/disconnect', async e => {
    const { dir, dbKey, version } = e.payload.db;
    const ref = await getOrCreateDb({ dir, dbKey, version });
    if (ref.swarm.isActive) {
      await ref.swarm.leave();
      logConnection(log, ref);
    }
  });

  // Finish up.
  return {
    events$: events$.pipe(share()),
  };
}

/**
 * [HELPERS]
 */

const logCreated = (log: t.ILog, ref: Ref) => {
  const key = ref.db.key;
  const localKey = ref.db.localKey;
  const external = key === localKey ? '' : log.cyan(' (external)');

  log.info(`Database ${log.yellow('created')}`);
  log.info.gray(`- storage:  ${ref.path}`);
  log.info.gray(`- key:      ${key}${external}`);
  log.info.gray(`- localKey: ${localKey}`);
  log.info.gray(`- version:  ${ref.version ? ref.version : '(latest)'}`);
  log.info();
};

const logConnection = (log: t.ILog, ref: Ref) => {
  const action = ref.swarm.isActive ? 'connected' : 'disconnected';
  log.info(`Database ${log.yellow(action)} from swarm`);
  log.info.gray(`- storage:  ${ref.path}`);
  log.info.gray(`- key:      ${ref.db.key}`);
  log.info.gray(`- version:  ${ref.version ? ref.version : '(latest)'}`);
  log.info();
};
