import { constants, t } from '../common';
import * as ipc from './preload.ipc';
import { lockdown } from './preload.lockdown';
import { MemoryCache } from '@platform/cache';

/**
 * The preload (sandbox) environment initialization.
 *
 * NOTE:
 *    From the electron documentation:
 *      https://www.electronjs.org/docs/api/browser-window
 *
 *
 *      Specifies a script that will be loaded before other scripts run in the page. This script
 *      will always have access to node APIs no matter whether node integration is turned on or off.
 *      The value should be the absolute file path to the script. When node integration is turned off,
 *      the preload script can reintroduce Node global symbols back to the global scope.
 *
 *      See example: https://www.electronjs.org/docs/api/process#event-loaded
 *
 */
export function init() {
  const { PROCESS } = constants;
  const isTopWindow = typeof window === 'object' && window === window.top;

  const windowUri = findArgv(PROCESS.WINDOW_URI);
  const host = findArgv(PROCESS.HOST);
  const isDev = Boolean(findArgv(PROCESS.DEV));

  // Initialize the environment
  const cache = MemoryCache.create();
  const { event$ } = ipc.init({ windowUri, cache });
  const env: t.IEnv = { host, def: windowUri, cache, event$ };
  if (isTopWindow) {
    const win = (window as unknown) as t.ITopWindow;
    win.env = env;
  }

  // Lock down the Chromium global object.
  lockdown();

  // Print environment details.
  if (isDev) {
    console.group('🌳 preload');
    console.log('isDev', isDev);
    console.log('host', host);
    console.log('def (window-uri):', windowUri); // TEMP 🐷
    console.log('env', env);
    console.log('process.argv:', process.argv);
    console.groupEnd();
    console.log('-------------------------------------------');
  }

  //
}

/**
 * [Helpers]
 */

// Read out the window-definition passed through the [process] arguments.
const findArgv = (key: string) => {
  const prefix = `${key}=`;
  const match = (process.argv || []).find(item => item === key || item.startsWith(prefix));
  return (match || '').replace(new RegExp(`^${prefix}`), '').trim();
};
