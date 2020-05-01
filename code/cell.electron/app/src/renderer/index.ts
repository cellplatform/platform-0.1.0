import { ipcRenderer } from 'electron';
import { Subject } from 'rxjs';

import { constants, t } from './common';
const { IPC } = constants;

// Read out the window-definition URI.
const uri = (process.argv.find(item => item.startsWith('window=')) || '').replace(/^window=/, '');

console.group('🌳 prerender');
console.log('window:', uri); // TEMP 🐷
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
