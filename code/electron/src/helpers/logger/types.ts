import { ILogEvent, LogLevel } from '@platform/log/lib/client';
export { ILogEvent, LogLevel };
export { ProcessType } from '../../types';

/**
 * IPC Events.
 */
export type LoggerEvents = LogWriteEvent;

export type LogWriteEvent = {
  type: 'LOG/write';
  payload: ILogEvent;
};
