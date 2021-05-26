import { ipcRenderer } from 'electron';

import { IPC, PROCESS } from './common/constants';

const CHANNEL = IPC.CHANNEL;

type O = Record<string, unknown>;
type Event = { type: string; payload: O };

ipcRenderer.on(CHANNEL, (ipc, event: Event) => {
  console.log('ipc', ipc);
  console.log('event', event);
});

const send = (event: Event) => {
  console.log('SEND to', CHANNEL, 'event: ', event);
  ipcRenderer.send(CHANNEL, event);
};

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

(async () => {
  const isDev = Boolean(findArgv(PROCESS.DEV));
  const argv = process.argv.filter((item) => item.startsWith('env:'));

  console.log('INIT', 'preload sandbox (RENDERER) 🌳🌳');
  if (isDev) console.log('process.argv', argv);

  send({ type: 'foo/tmp', payload: {} });
})();
