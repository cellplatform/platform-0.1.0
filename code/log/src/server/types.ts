export * from '../types';

import { ILog } from '../types';

export type ServerLog = ILog & {
  table(options?: LogTableOptions): LogTable;
};

/**
 * Table
 */
export type LogTableOptions = {
  head?: Array<string | number | undefined>;
  colWidths?: number[];
};

export type LogTable = {
  add: (columns: Array<string | number | undefined>) => LogTable;
  log: () => LogTable;
  toString: () => string;
};
