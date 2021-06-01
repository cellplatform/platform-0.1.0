import * as t from '../common/types';

export type ElectronWindowAction = 'close' | 'resize' | 'move';
export type ElectronWindowId = number;
export type ElectronWindowIdParam = ElectronWindowId | t.ElectronProcessWindowUri;

/**
 * The current status of an electron window.
 */
export type ElectronWindowStatus = {
  id: ElectronWindowId;
  uri: t.ElectronProcessWindowUri;
  url: string;
  title: string;
  bounds: WindowBounds;
  isVisible: boolean;
};
export type WindowBounds = { x: number; y: number; width: number; height: number };

/**
 * EVENTS
 */
export type WindowEvent =
  | ElectronWindowCreateReqEvent
  | WindowCreateResEvent
  | WindowsStatusReqEvent
  | WindowsStatusResEvent
  | WindowChangeEvent
  | ElectronWindowChangedEvent;

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
  devTools?: boolean | 'undocked' | 'right' | 'bottom' | 'detach';
  props: {
    isVisible?: boolean; // Default: true
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
export type WindowCreateResEvent = {
  type: 'runtime.electron/window/create:res';
  payload: WindowCreateRes;
};
export type WindowCreateRes = {
  tx: string;
  uri: string;
  isVisible: boolean;
};

/**
 * Fired to retrieve the status of open windows.
 */
export type WindowsStatusReqEvent = {
  type: 'runtime.electron/windows/status:req';
  payload: WindowsStatusReq;
};
export type WindowsStatusReq = { tx: string };

export type WindowsStatusResEvent = {
  type: 'runtime.electron/windows/status:res';
  payload: WindowsStatusRes;
};
export type WindowsStatusRes = { tx: string; windows: ElectronWindowStatus[] };

/**
 * Fires to initiate a change to a window
 */
export type WindowChangeEvent = {
  type: 'runtime.electron/window/change';
  payload: WindowChange;
};
export type WindowChange = {
  uri: t.ElectronProcessWindowUri;
  bounds?: Partial<WindowBounds>;
  isVisible?: boolean;
};

/**
 * Fired when a windows state has changed.
 */
export type ElectronWindowChangedEvent = {
  type: 'runtime.electron/window/changed';
  payload: ElectronWindowChanged;
};
export type ElectronWindowChanged = {
  uri: t.ElectronProcessWindowUri;
  action: ElectronWindowAction;
  bounds: WindowBounds;
};
