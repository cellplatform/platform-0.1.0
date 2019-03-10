import { create, Db, Network } from '@platform/hyperdb';
import { Subject } from 'rxjs';
import { share, filter } from 'rxjs/operators';

import { value } from '../common';
import * as t from './types';

type Ref = { db: t.IDb; network: t.INetwork; dir: string; version?: string };
type Refs = { [key: string]: Ref };
const refs: Refs = {};

/**
 * Start the HyperDB IPC handler's listening on the [main] process.
 */
export function listen(args: { ipc: t.IpcClient; log: t.ILog }) {
  const ipc = args.ipc as t.DbIpcRendererClient & t.NetworkIpcRendererClient;
  const log = args.log;
  const events$ = new Subject<t.MainDbEvent>();
  log.info(`listening for ${log.yellow('hyperdb events')}`);

  const createDb = async (args: { dir: string; dbKey?: string; version?: string }) => {
    const { dir, dbKey, version } = args;

    // Construct the DB.
    const res = await create({ dir, dbKey, version });
    const { db, network } = res;

    // Ferry events to clients.
    db.events$.subscribe(e => ipc.send(e.type, e.payload));
    // network.events$.subscribe(e => ipc.send(e.type, e.payload));

    network.events$.pipe(filter(e => e.type === 'NETWORK/connection')).subscribe(e => {
      console.log(`\nTODO 🐷   Ferry events like above with DB \n`);
      sendNetworkUpdate({ dir });
    });

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
    const ref: Ref = { db, network, dir };

    const isAuthorized = await db.isAuthorized();
    logCreated(log, ref, isAuthorized);
    return ref;
  };

  const getRefKey = (args: { dir: string; dbKey?: string; version?: string }) => {
    const { dir, version } = args;
    let refKey = dir;
    refKey = version ? `${refKey}/ver:${version}` : refKey;
    return refKey;
  };

  const getRef = async (args: {
    dir: string;
    dbKey?: string;
    version?: string;
  }): Promise<Ref | undefined> => {
    const refKey = getRefKey(args);
    return refs[refKey];
  };

  const getOrCreateDb = async (args: { dir: string; dbKey?: string; version?: string }) => {
    const refKey = getRefKey(args);
    refs[refKey] = refs[refKey] || createDb(args);
    return refs[refKey];
  };

  /**
   * [DB-HANDLE] state requests from DB `renderer` clients
   * and fire back the latest values.
   */
  ipc.handle<t.IDbGetStateEvent>('DB/state/get', async e => {
    type E = t.IDbUpdateStateEvent;
    type P = E['payload'];
    const { dir, dbKey, version } = e.payload.db;
    const { db } = await getOrCreateDb({ dir, dbKey, version });
    try {
      const { dir, key, discoveryKey, localKey, watching, isDisposed } = db;
      const props: t.IDbProps = { dir, key, discoveryKey, localKey, watching, isDisposed };
      const payload: P = { db: { dir }, props };
      ipc.send<E>('DB/state/update', payload);
    } catch (err) {
      const type: E['type'] = 'DB/state/update';
      const message = `[${type}] Failed to get state fields of DB '${dir}'. ${err.message}`;
      log.error(message);
    }
  });

  /**
   * [DB-HANDLE] invoke requests from DB `renderer` clients.
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
   * [DB-HANDLE] requests to `disconnect` (leave the swarm).
   */
  ipc.handle<t.IDbConnectEvent>('DB/connect', async e => {
    const { dir, dbKey, version } = e.payload.db;
    const ref = await getOrCreateDb({ dir, dbKey, version });
    if (!ref.network.isConnected) {
      await ref.network.connect();
      logConnection(log, ref);
    }
  });

  /**
   * [DB-HANDLE] requests to `connect` (leave the swarm).
   */
  ipc.handle<t.IDbDisconnectEvent>('DB/disconnect', async e => {
    const { dir, dbKey, version } = e.payload.db;
    const ref = await getOrCreateDb({ dir, dbKey, version });
    if (ref.network.isConnected) {
      await ref.network.disconnect();
      logConnection(log, ref);
    }
  });

  /**
   * [NETWORK-HANDLE] state requests from Network `renderer` clients
   * and fire back the latest values.
   */
  ipc.handle<t.INetworkGetStateEvent>('NETWORK/state/get', async e => {
    const { dir } = e.payload.db;
    sendNetworkUpdate({ dir });
  });

  const sendNetworkUpdate = async (args: { dir: string }) => {
    console.log('send update to', args.dir);

    type E = t.INetworkUpdateStateEvent;
    type P = E['payload'];
    const { dir } = args;
    const ref = await getRef({ dir });

    const type: E['type'] = 'NETWORK/state/update';
    const errorPrefix = `[${type}] Failed to get state fields of Network for DB '${dir}'`;
    if (!ref) {
      const message = `${errorPrefix}. The DB has not been created yet.`;
      log.error(message);
      return;
    }
    try {
      const { topic, status, isConnected, connection, db, isDisposed } = ref.network;
      const props: t.INetworkProps = { topic, status, isConnected, connection, db, isDisposed };
      const payload: P = { db: { dir }, props };
      ipc.send<E>('NETWORK/state/update', payload);
    } catch (err) {
      const message = `${errorPrefix}. ${err.message}`;
      log.error(message);
    }
  };

  // Finish up.
  return {
    events$: events$.pipe(share()),
  };
}

/**
 * [HELPERS]
 */

const logCreated = (log: t.ILog, ref: Ref, isAuthorized: boolean) => {
  const db = ref.db;
  const key = db.key;
  const localKey = db.localKey;
  const isExternal = key !== localKey;
  const external = isExternal ? ` (${log.magenta('peer')})` : ` (${log.yellow('primary')})`;
  const auth = isAuthorized ? 'writer' : 'reader';

  log.info(`Database ${log.yellow('created')}`);
  log.info.gray(`- storage:   ${ref.dir}`);
  log.info.gray(`- key:       ${log.cyan(key)}${external}`);
  log.info.gray(`- localKey:  ${isExternal ? localKey : log.cyan(localKey)}`);
  log.info.gray(`- auth:      ${auth}`);
  log.info.gray(`- version:   ${ref.version ? ref.version : 'latest'}`);
  log.info();
};

const logConnection = (log: t.ILog, ref: Ref) => {
  const action = ref.network.isConnected ? 'connected' : 'disconnected';
  log.info(`Database ${log.yellow(action)} from swarm`);
  log.info.gray(`- storage:  ${ref.dir}`);
  log.info.gray(`- key:      ${ref.db.key}`);
  log.info.gray(`- version:  ${ref.version ? ref.version : '(latest)'}`);
  log.info();
};
