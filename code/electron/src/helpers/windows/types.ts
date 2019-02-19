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
};

/**
 * Represents a single window.
 */
export type IWindowRef = {
  id: number;
  tags: IWindowTag[];
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
export type WindowsEvents = IWindowChangedEvent | IWindowsGetEvent | IWindowsTagEvent;

export type IWindowChangedEvent = {
  type: '@platform/WINDOWS/change';
  payload: IWindowChange;
};
export type IWindowChange = {
  type: 'CREATED' | 'CLOSED' | 'TAG' | 'FOCUS' | 'REFRESH';
  windowId?: number;
  state: IWindowsState;
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
