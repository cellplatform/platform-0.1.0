import { IpcHandlerResponseEvent } from './types';

export * from '../constants';

type EventTypes = {
  HANDLER: IpcHandlerResponseEvent['type'];
};

export const EVENT: EventTypes = {
  HANDLER: './SYS/IPC/handler/response',
};
