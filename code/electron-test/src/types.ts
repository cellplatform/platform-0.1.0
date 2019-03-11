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
  | INewWindowEvent
  | IMessageEvent
  | IShowDevToolsEvent
  | IFooEvent
  | IBarEvent;

export type INewWindowEvent = {
  type: 'NEW_WINDOW';
  payload: {
    name?: string;
  };
};

export type IMessageEvent = {
  type: 'MESSAGE';
  payload: { text: string };
};

export type IShowDevToolsEvent = {
  type: 'DEVTOOLS/show';
  payload: { windowId: number };
};

export type IFooEvent = {
  type: 'FOO';
  payload: { count: number };
};

export type IBarEvent = {
  type: 'BAR';
  payload: {};
};
