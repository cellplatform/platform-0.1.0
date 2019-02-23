import { Db } from '../helpers/db';
import { Swarm } from '../helpers/swarm/main';
import * as t from '../types';
import * as ipc from './main.ipc';

export { Db, Swarm };
export * from '../types';

/**
 * Initializes a the `main` process for managing HyperDB requests from renderers.
 */
export async function init(args: { ipc: t.IpcClient; log: t.ILog }) {
  await ipc.init({ ipc: args.ipc, log: args.log });
}

/**
 * Create a new network connected HyperDB on the `main` process.
 */
export { create } from './main.create';
