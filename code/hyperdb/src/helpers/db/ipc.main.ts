import * as t from './types';
import { Db } from './Db.main';

type Refs = { [key: string]: Db };
const refs: Refs = {};

/**
 * The IPC handler on the [main] process that manages DB's.
 */
export function init(args: { ipc: t.IpcClient; log: t.ILog }) {
  const ipc = args.ipc as t.DbIpcClient;

  const getOrCreateDb = async (args: { storage: string; dbKey?: string }) => {
    const { storage: key } = args;
    refs[key] = refs[key] || (await Db.create(args));
    return refs[key];
  };

  /**
   * GET state requests from DB `renderer` clients.
   */
  ipc.handle<t.IDbIpcGetStateEvent, t.IDbIpcGetStateResponse>('HYPERDB/getState', async e => {
    const { storage, dbKey } = e.payload;
    const db = await getOrCreateDb({ storage, dbKey });
    const { key, localKey, discoveryKey, watching, isDisposed } = db;
    return {
      props: { key, localKey, discoveryKey, watching, isDisposed },
    };
  });
}
