const Table = require('cli-table');
import { compact } from '../common';
import { ILog, LogTable, LogTableOptions } from './types';

/**
 * Creates a new table builder.
 */
export function table(log: ILog, options: LogTableOptions = {}) {
  const { head = [], colWidths = [] } = options;
  const t = new Table({
    head: compact(head),
    colWidths,
  });
  const api: LogTable = {
    /**
     * Adds a new row to the table.
     */
    add(columns: Array<string | number | undefined>) {
      t.push(columns.map(row => (row === undefined ? '' : row.toString())));
      return api;
    },

    /**
     * Converts the table to a string.
     */
    toString() {
      return t.toString();
    },

    /**
     * Logs the table to the console.
     */
    log() {
      log.info(api.toString());
      return api;
    },
  };
  return api;
}
