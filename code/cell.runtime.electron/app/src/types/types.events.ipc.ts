import { t } from './common';

export type IpcEvent = IpcSendEvent;

/**
 * Fired to send data over the IPC channel.
 */
export type IpcSendEvent = {
  type: 'runtime.electron/ipc/send';
  payload: IpcSend;
};
export type IpcSend = {
  sender: t.ElectronUri;
  targets: t.ElectronUri[];
  event: t.Event;
};
