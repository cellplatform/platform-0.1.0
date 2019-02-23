import * as t from '../helpers/db/types';
import { Db } from '../helpers/db/Db';
import { Swarm } from '../helpers/swarm/main';
import { create } from './main.create';
import { value, is } from '../helpers/common';
import { fs } from '@platform/fs';
import { app } from 'electron';

type Ref = { db: Db; swarm: Swarm; path: string; version?: string };
type Refs = { [key: string]: Ref };
const refs: Refs = {};

/**
 * The IPC handler on the [main] process that manages DB's.
 */
export function init(args: { ipc: t.IpcClient; log: t.ILog }) {
  const ipc = args.ipc as t.DbIpcClient;
  const log = args.log;

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

    // Log the creation.
    log.info(`Database created`);
    log.info.gray(`- storage:  ${path}`);
    log.info.gray(`- key:      ${db.key}`);
    log.info.gray(`- version:  ${version ? version : '(latest)'}`);
    log.info();

    // Ferry events to clients.
    db.events$.subscribe(e => ipc.send(e.type, e.payload));

    // Finish up.
    const ref: Ref = { db, swarm, path };
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
   * HANDLE state requests from DB `renderer` clients and
   * fire back the latest values.
   */
  ipc.handle<t.IDbGetStateEvent>('DB/state/get', async e => {
    type E = t.IDbUpdateStateEvent;
    type P = E['payload'];
    const { dir, dbKey, version } = e.payload.db;
    const db = (await getOrCreateDb({ dir, dbKey, version })).db;
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
   * HANDLE invoke requests from DB `renderer` clients.
   */
  ipc.handle<t.IDbInvokeEvent, t.IDbInvokeResponse>('DB/invoke', async e => {
    const { method, params } = e.payload;
    const { dir, dbKey, version } = e.payload.db;
    const db = (await getOrCreateDb({ dir, dbKey, version })).db;
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
}
