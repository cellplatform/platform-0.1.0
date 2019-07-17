import { lastPart, coord } from './common';

/**
 * Keys for items within the database.
 */
export class DbSchema {
  public static create = (args: {}) => new DbSchema(args);
  private constructor(args: {}) {}

  public static toKey(prefix: string, key: string | number | { key: string }) {
    key = typeof key === 'number' ? key.toString() : key;
    key = typeof key === 'object' ? key.key : (key || '').toString();
    key = lastPart(key, '/');
    return !key ? '' : `${prefix}${key}`;
  }

  private get prefix() {
    return {
      cell: 'cell/',
      column: 'column/',
      row: 'row/',
    };
  }

  public toCellKey(key: string | { key: string }) {
    return DbSchema.toKey(this.prefix.cell, key);
  }

  public toColumnKey(key: number | string) {
    key = typeof key === 'number' ? coord.cell.toKey(key) : key;
    return DbSchema.toKey(this.prefix.column, key);
  }

  public toRowKey(key: number | string) {
    return DbSchema.toKey(this.prefix.row, key);
  }

  public get all() {
    return {
      cells: `${this.prefix.cell}*`,
      columns: `${this.prefix.column}*`,
      rows: `${this.prefix.row}*`,
    };
  }

  public get is() {
    return {
      cell: (key: string) => key.startsWith(this.prefix.cell),
      column: (key: string) => key.startsWith(this.prefix.column),
      row: (key: string) => key.startsWith(this.prefix.row),
    };
  }
}
