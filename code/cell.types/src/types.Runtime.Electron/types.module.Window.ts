import { t } from './common';

export type WindowAction = 'close' | 'resize' | 'move';
export type WindowId = number;
export type WindowIdParam = WindowId | t.ProcessWindowUri;

/**
 * The current status of an electron window.
 */
export type WindowStatus = {
  id: WindowId;
  uri: t.ProcessWindowUri;
  url: string;
  title: string;
  bounds: WindowBounds;
  isVisible: boolean;
};
export type WindowBounds = { x: number; y: number; width: number; height: number };

/**
 * Event API.
 */
export type WindowEvents = t.Disposable & {
  $: t.Observable<WindowEvent>;
  is: { base(input: any): boolean };

  create: {
    req$: t.Observable<t.WindowCreateReq>;
    res$: t.Observable<t.WindowCreateRes>;
    fire(args: {
      url: string;
      devTools?: t.WindowCreateReq['devTools'];
      props?: t.WindowCreateReq['props'];
    }): Promise<t.WindowCreateRes>;
  };

  status: {
    req$: t.Observable<t.WindowStatusReq>;
    res$: t.Observable<t.WindowsStatusRes>;
    get(): Promise<{ windows: t.WindowStatus[] }>;
  };

  change: {
    before$: t.Observable<t.WindowChange>;
    after$: t.Observable<t.WindowChanged>;
    fire(
      window: t.WindowIdParam,
      options?: { bounds?: Partial<t.WindowBounds>; isVisible?: boolean },
    ): void;
  };
};

/**
 * EVENTS
 */
export type WindowEvent =
  | WindowCreateReqEvent
  | WindowCreateResEvent
  | WindowStatusReqEvent
  | WindowsStatusResEvent
  | WindowChangeEvent
  | WindowChangedEvent;

/**
 * Fired to create a new window.
 */
export type WindowCreateReqEvent = {
  type: 'runtime.electron/Window/create:req';
  payload: WindowCreateReq;
};
export type WindowCreateReq = {
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
  type: 'runtime.electron/Window/create:res';
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
export type WindowStatusReqEvent = {
  type: 'runtime.electron/Window/status:req';
  payload: WindowStatusReq;
};
export type WindowStatusReq = { tx: string };

export type WindowsStatusResEvent = {
  type: 'runtime.electron/Window/status:res';
  payload: WindowsStatusRes;
};
export type WindowsStatusRes = {
  tx: string;
  windows: WindowStatus[];
};

/**
 * Fires to initiate a change to a window
 */
export type WindowChangeEvent = {
  type: 'runtime.electron/Window/change';
  payload: WindowChange;
};
export type WindowChange = {
  uri: t.ProcessWindowUri;
  bounds?: Partial<WindowBounds>;
  isVisible?: boolean;
};

/**
 * Fired when a windows state has changed.
 */
export type WindowChangedEvent = {
  type: 'runtime.electron/Window/changed';
  payload: WindowChanged;
};
export type WindowChanged = {
  uri: t.ProcessWindowUri;
  action: WindowAction;
  bounds: WindowBounds;
};
