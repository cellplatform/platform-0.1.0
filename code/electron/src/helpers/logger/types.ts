import { ILogEvent, LogLevel, ILog } from '@platform/log/lib/client/types';
import { IServerLog } from '@platform/log/lib/server/types';
export { ILogEvent, LogLevel, ILog };
export { ProcessType } from '../../types';

export type IMainLog = IServerLog & {
  paths: {
    dir: string;
    dev: string;
    prod: string;
  };
};

/**
 * IPC Events.
 */
export type LoggerEvents = ILogWriteEvent;

export type ILogWriteEvent = {
  type: '@platform/LOG/write';
  payload: ILogEvent;
};
