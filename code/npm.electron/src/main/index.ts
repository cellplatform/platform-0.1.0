export * from '../types';
import * as t from '../types';
import { listen } from './main.ipc';

/**
 * Initializes the `main` process for working with NPM.
 */
export function init(args: { ipc: t.IpcClient; log: t.IMainLog }) {
  const { ipc, log } = args;
  listen({ ipc, log });
}
