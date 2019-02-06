import { Observable } from 'rxjs';

/**
 * [Log]
 */
export type Loggable = any;
export type Logger = (...items: Loggable[]) => string;

export type LogNext = (
  level: LogLevel,
  color: LogColor,
  items: Loggable[],
) => string;

export type LogLevel = 'info' | 'warn' | 'error';

export type LogColor =
  | 'black'
  | 'red'
  | 'green'
  | 'yellow'
  | 'blue'
  | 'magenta'
  | 'cyan'
  | 'white'
  | 'gray';

export type ILogColors = {
  black: Logger;
  red: Logger;
  green: Logger;
  yellow: Logger;
  blue: Logger;
  magenta: Logger;
  cyan: Logger;
  white: Logger;
  gray: Logger;
};

export type LogMethod = ILogColors & Logger;

export type ILog = ILogColors & {
  events$: Observable<ILogAction>;
  silent: boolean;
  info: LogMethod;
  warn: LogMethod;
  error: LogMethod;
  TODO: LogMethod;
  DEBUG: LogMethod;
  group: LogMethod;
  groupEnd: () => void;
  clear: () => void;
};

/**
 * [EVENTS]
 */
export type ILogAction = {
  type: 'LOG' | 'CLEAR' | 'GROUP' | 'UNGROUP';
  payload: ILogEvent | ILogClearEvent;
};

export type ILogEvent = {
  items: Loggable[];
  level: LogLevel;
  color: LogColor;
  output: any;
};

export type ILogClearEvent = {};
