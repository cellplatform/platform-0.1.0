import { ipcRenderer } from 'electron';
import { Subject } from 'rxjs';

import { constants, t } from './common';
const { IPC, PROCESS } = constants;

// Read out the window-definition passed through the [process] arguments.
const getWindowUri = () => {
  const prefix = `${PROCESS.WINDOW_URI}=`;
  const match = (process.argv || []).find(item => item.startsWith(prefix));
  return (match || '').replace(new RegExp(`^${prefix}`), '');
};

const uri = getWindowUri();

console.group('🌳 prerender');
console.log('window-uri:', uri); // TEMP 🐷
console.log('process.argv:', process.argv);
// console.log("-------------------------------------------")
console.groupEnd();

// Hook into IPC events.
const ipc$ = new Subject<t.IpcEvent>();
ipcRenderer.on(IPC.CHANNEL, (ipc, event: t.IpcEvent) => ipc$.next(event));

ipc$.pipe().subscribe(e => {
  const isSelf = e.payload.window === uri;
  const out = isSelf ? { ...e, isSelf } : e;

  console.log('🌼ipc event:', out);
});

console.log('-------------------------------------------');
