import * as t from '../types';
import { DbRenderer } from './renderer.Db';
import { NetworkRenderer } from './renderer.Network';

export * from '../types';
export * from '@platform/electron/lib/renderer';

/**
 * Initializes a new DB/Network on the `renderer` process.
 */
export const creator = (args: { ipc: t.IpcClient }) => {
  const { ipc } = args;

  const factory: t.CreateDatabase<t.IDbRenderer, t.INetworkRenderer> = async (
    args: t.ICreateDatabaseArgs,
  ) => {
    const { dir, dbKey, connect } = args;
    const db = (await DbRenderer.create({ ipc, dir, dbKey })) as t.IDbRenderer;
    const network = (await NetworkRenderer.create({ db, ipc, connect })) as t.INetworkRenderer;
    return { db, network };
  };

  return factory;
};
