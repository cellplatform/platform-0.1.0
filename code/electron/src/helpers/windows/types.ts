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
  refresh: () => Promise<void>;
  tag: (id: number, ...tag: IWindowTag[]) => Promise<void>;
  toObject(): IWindowsState;
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
  key: string;
  value?: string | number | boolean;
};

/**
 * IPC Events.
 */
export type WindowsEvents = IWindowChangedEvent | IWindowsGetEvent;

export type IWindowChangedEvent = {
  type: '@platform/WINDOWS/change';
  payload: IWindowChange;
};
export type IWindowChange = {
  type: 'CREATED' | 'CLOSED' | 'TAG' | 'FOCUS';
  windowId?: number;
  state: IWindowsState;
};

export type IWindowsGetEvent = {
  type: '@platform/WINDOWS/get';
  payload: {};
};
export type IWindowsGetResponse = IWindowsState & {};
