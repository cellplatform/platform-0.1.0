export type IpcEvent = IpcMessageEvent | IpcSystemReqEvent | IpcSystemResEvent;

type O = Record<string, unknown>;
type Event = { type: string; payload: O };
type Uri = string;

/**
 * Fired to send data over the IPC channel.
 */
export type IpcMessageEvent = {
  type: 'runtime.electron/ipc/msg';
  payload: IpcMessage;
};
export type IpcMessage = {
  sender: Uri;
  targets: Uri[];
  data: Event;
};

/**
 * Fired to retrieve the current system state.
 */
export type IpcSystemReqEvent = {
  type: 'runtime.electron/ipc/sys:req';
  payload: IpcSystemReq;
};
export type IpcSystemReq = {
  sender: Uri;
};

export type IpcSystemResEvent = {
  type: 'runtime.electron/ipc/sys:res';
  payload: IpcSystemRes;
};
export type IpcSystemRes = {
  main: Uri;
  windows: Uri[];
};
