import { Observable } from 'rxjs';

/**
 * Represents all windows.
 */
export type IWindowsState = {
  focused?: IWindowRef;
  refs: IWindowRef[];
};

export type IWindows = IWindowsState & {
  change$: Observable<IWindowChange>;
  refresh(): Promise<void>;
  toObject(): IWindowsState;
  tag(windowId: number, ...tag: IWindowTag[]): Promise<void>;
  byTag(tag: IWindowTag['tag'], value?: IWindowTag['value']): IWindowRef[];
  byTag(...tags: IWindowTag[]): IWindowRef[];
  byIds(...windowId: number[]): IWindowRef[];
  byId(windowId: number): IWindowRef;
  visible(isVisible: boolean, ...windowId: number[]): IWindows;
};

/**
 * Represents a single window.
 */
export type IWindowRef = {
  id: number;
  tags: IWindowTag[];
  isVisible: boolean;
  parent?: number;
  children: number[];
};

/**
 * A categorization for a window.
 */
export type IWindowTag = {
  tag: string;
  value?: string | number | boolean;
};

/**
 * IPC Events.
 */
export type WindowsEvent =
  | IWindowChangeEvent
  | IWindowsRefreshEvent
  | IWindowsGetEvent
  | IWindowsTagEvent
  | IWindowsVisibleEvent;

export type IWindowChangeEvent = {
  type: '@platform/WINDOW/change';
  payload: IWindowChange;
};
export type IWindowChange = {
  type: 'CREATED' | 'CLOSED' | 'TAG' | 'VISIBILITY' | 'FOCUS' | 'BLUR';
  window: IWindowRef;
  state: IWindowsState;
};

export type IWindowsRefreshEvent = {
  type: '@platform/WINDOWS/refresh';
  payload: {};
};

export type IWindowsGetEvent = {
  type: '@platform/WINDOWS/get';
  payload: {};
};
export type IWindowsGetResponse = IWindowsState & {};

export type IWindowsTagEvent = {
  type: '@platform/WINDOWS/tag';
  payload: {
    windowId: number;
    tags: IWindowTag[];
  };
};

export type IWindowsVisibleEvent = {
  type: '@platform/WINDOWS/visible';
  payload: {
    isVisible: boolean;
    windowId: number[];
  };
};
