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
  | IDevToolsEvent
  | IFooEvent
  | IBarEvent;

export type INewWindowEvent = {
  type: 'TEST/window/new';
  payload: {
    name?: string;
  };
};

export type IMessageEvent = {
  type: 'TEST/message';
  payload: { text: string };
};

export type IDevToolsEvent = {
  type: 'TEST/devTools';
  payload: { windowId: number; show: boolean; focus?: boolean };
};

export type IFooEvent = {
  type: 'FOO';
  payload: { count: number };
};

export type IBarEvent = {
  type: 'BAR';
  payload: {};
};
