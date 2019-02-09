import { SystemEvents } from '@platform/electron';

export type MyEvents =
  | SystemEvents
  | INewWindowEvent
  | IMessageEvent
  | IFooEvent
  | ICreateDevToolsEvent;

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

export type IFooEvent = {
  type: 'FOO';
  payload: { count: number };
};

export type ICreateDevToolsEvent = {
  type: 'DEVTOOLS/create';
  payload: { windowId: number };
};
