export * from '../types';
import { ILog } from '../types';

/**
 * A version of the log that runs on the server.
 */
export type IServerLog = ILog & {
  table(options?: ILogTableOptions): ILogTable;
};

/**
 * Table
 */
export type ILogTableOptions = {
  head?: (string | number | undefined)[];
  colWidths?: number[];
  border?: boolean;
};

export type ILogTable = {
  add: (columns: (string | number | undefined)[]) => ILogTable;
  log: () => ILogTable;
  toString: () => string;
};
