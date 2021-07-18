import { t } from './common';

type Uri = string;
export type LogWriteLevel = 'info' | 'warn' | 'error';

/**
 * Events
 */
export type LogEvent = LogWriteEvent | LogClearEvent;

/**
 * Request a message be written to the log.
 */
export type LogWriteEvent = {
  type: 'runtime.electron/Log/write';
  payload: LogWrite;
};
export type LogWrite = {
  sender: Uri;
  level: LogWriteLevel;
  message: t.Json[];
};

/**
 * Clear the local log (console).
 */
export type LogClearEvent = {
  type: 'runtime.electron/Log/clear';
  payload: LogClear;
};
export type LogClear = { sender: Uri };
