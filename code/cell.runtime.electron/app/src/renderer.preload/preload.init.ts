import {
  ElectronEnv,
  ElectronEnvKey,
} from '@platform/cell.types/lib/types.Runtime.electron/types.env';
import { contextBridge } from 'electron';

import { IPC, PROCESS } from './common';
import { IpcTransport } from './preload.IpcTransport';

/**
 * The preload (secure "sandbox") environment initialization.
 */
export function init() {
  const isDev = Boolean(findArgv(PROCESS.DEV));
  const runtime = findArgv(PROCESS.RUNTIME);
  const self = findArgv(PROCESS.URI_SELF);
  const channel = IPC.CHANNEL;

  /**
   * Setup the network pump.
   * (used by the NetworkBus in the loaded environment)
   */
  const network = IpcTransport({ self, channel });

  /**
   * Store the runtime environment.
   */
  const env: ElectronEnv = { self, runtime, network };
  const key: ElectronEnvKey = 'cell.runtime.electron';
  contextBridge.exposeInMainWorld(key, env);

  /**
   * Print environment details.
   */
  if (isDev) {
    console.group('🌳 preload (sandbox)');
    console.log('isDev', isDev);
    console.log('env', env);
    process.argv
      .filter((value) => value.startsWith('env:'))
      .forEach((value) => console.log(`• process.argv/${value}`));
    console.groupEnd();
    console.log('-------------------------------------------');
  }
}

/**
 * [Helpers]
 */

/**
 * Read out the window-definition passed through
 * the [process.argv] arguments.
 */
function findArgv(key: string) {
  const prefix = `${key}=`;
  const match = (process.argv || []).find((item) => item === key || item.startsWith(prefix));
  return (match || '').replace(new RegExp(`^${prefix}`), '').trim();
}
