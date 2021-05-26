import * as t from '../common/types';

export type ElectronWindowChangeAction = 'close' | 'resize' | 'move';
export type ElectronWindowId = number;
export type ElectronWindowIdParam = ElectronWindowId | t.ElectronWindowUri;

/**
 * The current status of an electron window.
 */
export type ElectronWindowStatus = {
  uri: t.ElectronWindowUri;
  url: string;
  title: string;
  bounds: ElectronWindowBounds;
};
export type ElectronWindowBounds = { x: number; y: number; width: number; height: number };

/**
 * EVENTS
 */
export type ElectronWindowEvent =
  | ElectronWindowCreateReqEvent
  | ElectronWindowCreateResEvent
  | ElectronWindowsStatusReqEvent
  | ElectronWindowsStatusResEvent
  | ElectronWindowChangeEvent
  | ElectronWindowChangedEvent
  | ElectronWindowIpcSendEvent;

/**
 * Fired to create a new window.
 */
export type ElectronWindowCreateReqEvent = {
  type: 'runtime.electron/window/create:req';
  payload: ElectronWindowCreateReq;
};
export type ElectronWindowCreateReq = {
  tx: string;
  url: string;
  showOnLoad?: boolean;
  devTools?: boolean | 'undocked' | 'right' | 'bottom' | 'detach';
  props: {
    title?: string;
    x?: number;
    y?: number;
    width?: number;
    minWidth?: number;
    maxWidth?: number;
    height?: number;
    minHeight?: number;
    maxHeight?: number;
  };
};
export type ElectronWindowCreateResEvent = {
  type: 'runtime.electron/window/create:res';
  payload: ElectronWindowCreateRes;
};
export type ElectronWindowCreateRes = {
  tx: string;
  isShowing: boolean; // NB: Will be true if [showOnLoad] was requested.
};

/**
 * Fired to retrieve the status of open windows.
 */
export type ElectronWindowsStatusReqEvent = {
  type: 'runtime.electron/windows/status:req';
  payload: ElectronWindowsStatusReq;
};
export type ElectronWindowsStatusReq = { tx: string };

export type ElectronWindowsStatusResEvent = {
  type: 'runtime.electron/windows/status:res';
  payload: ElectronWindowsStatusRes;
};
export type ElectronWindowsStatusRes = { tx: string; windows: ElectronWindowStatus[] };

/**
 * Fires to initiate a change to a window
 */
export type ElectronWindowChangeEvent = {
  type: 'runtime.electron/window/change';
  payload: ElectronWindowChange;
};
export type ElectronWindowChange = {
  uri: t.ElectronWindowUri;
  bounds?: Partial<ElectronWindowBounds>;
};

/**
 * Fired when a windows state has changed.
 */
export type ElectronWindowChangedEvent = {
  type: 'runtime.electron/window/changed';
  payload: ElectronWindowChanged;
};
export type ElectronWindowChanged = {
  uri: t.ElectronWindowUri;
  action: ElectronWindowChangeAction;
  bounds: ElectronWindowBounds;
};

/**
 * Fired to send data over the IPC channel.
 */
export type ElectronWindowIpcSendEvent = {
  type: 'runtime.electron/window/ipc/send';
  payload: ElectronWindowIpcSend;
};
export type ElectronWindowIpcSend = {
  targets: t.ElectronWindowUri[];
  event: t.Event;
};
