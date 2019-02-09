import { IpcHandlerResponseEvent } from './types';

export const CHANNEL = {
  EVENTS: '.SYS/IPC/events',
};

export const EVENT: {
  HANDLER: IpcHandlerResponseEvent['type'];
} = {
  HANDLER: './SYS/IPC/handler/response',
};
