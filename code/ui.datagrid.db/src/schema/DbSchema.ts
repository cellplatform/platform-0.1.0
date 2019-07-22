import { lastPart, coord } from './common';

/**
 * Keys for items within the database.
 */
export class DbSchema {
  /**
   * [Static]
   */
  public static toKey(prefix: string, key: string | number | { key: string }) {
    key = DbSchema.asString(key);
    key = lastPart(key, '/');
    return !key ? '' : `${prefix}/${key}`;
  }

  public static asString(key: string | number | { key: string }) {
    key = typeof key === 'number' ? key.toString() : key;
    key = typeof key === 'object' ? key.key : (key || '').toString();
    return key;
  }

  /**
   * [Lifecycle]
   */
  public static create = (args: {}) => new DbSchema(args);
  private constructor(args: {}) {}

  /**
   * [Properties]
   */
  private get prefix() {
    return {
      cell: 'cell',
      column: 'column',
      row: 'row',
    };
  }

  public get is() {
    return {
      cell: (key: string) => key.startsWith(this.prefix.cell),
      column: (key: string) => key.startsWith(this.prefix.column),
      row: (key: string) => key.startsWith(this.prefix.row),
    };
  }

  /**
   * [Methods]
   */

  public toKey(key: string | { key: string }) {
    key = DbSchema.asString(key);
    if (key === undefined || key === '') {
      return '';
    }

    const type = coord.cell.toType(key);
    switch (type) {
      case 'CELL':
        return this.toCellKey(key);

      case 'COLUMN':
        return this.toColumnKey(key);

      case 'ROW':
        return this.toRowKey(key);

      default:
        throw new Error(`Cell type '${type}' not supported.`);
    }
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
      cells: `${this.prefix.cell}/*`,
      columns: `${this.prefix.column}/*`,
      rows: `${this.prefix.row}/*`,
    };
  }
}
