import { SystemEvents } from '@platform/electron/lib/types';

/**
 * Store
 */
export type IMyStore = {
  count: number;
  foo: {
    bar: boolean;
  };
};

/**
 * EVENTS
 */
export type MyEvents =
  | SystemEvents
  | ITestNewWindowEvent
  | ITestMessageEvent
  | ITestWindowsRefreshEvent
  | ITestWindowsWriteMainEvent
  | IFooEvent
  | IBarEvent;

export type ITestNewWindowEvent = {
  type: 'TEST/window/new';
  payload: { name?: string };
};

export type ITestMessageEvent = {
  type: 'TEST/message';
  payload: { text: string };
};

export type ITestWindowsRefreshEvent = {
  type: 'TEST/windows/refresh';
  payload: {};
};

export type ITestWindowsWriteMainEvent = {
  type: 'TEST/windows/write/main';
  payload: {};
};

export type IFooEvent = {
  type: 'FOO';
  payload: { count: number };
};

export type IBarEvent = {
  type: 'BAR';
  payload: {};
};
