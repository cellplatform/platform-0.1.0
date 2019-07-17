import { cell as util } from '@platform/util.value.cell';

/**
 * DB/Grid key generator.
 */
export class Keys {
  public static create = (args: {}) => new Keys();
  public db = new DbKeys();
  public grid = new GridKeys();
}

/**
 * Keys for items within the database.
 */
export class DbKeys {
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
    return DbKeys.toKey(this.prefix.cell, key);
  }

  public toColumnKey(key: number | string) {
    key = typeof key === 'number' ? util.toKey(key) : key;
    return DbKeys.toKey(this.prefix.column, key);
  }

  public toRowKey(key: number | string) {
    return DbKeys.toKey(this.prefix.row, key);
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

/**
 * Keys for items within the grid.
 */
export class GridKeys {
  public toCellKey(key: string) {
    return lastPart(key, '/').toUpperCase();
  }
  public toColumnKey(key: string) {
    return lastPart(key, '/').toUpperCase();
  }
  public toRowKey(key: string | number) {
    return lastPart(key, '/').toUpperCase();
  }
}

/**
 * [Helpers]
 */
function lastPart(text: string | number, delimiter: string) {
  text = text === undefined ? '' : text;
  const parts = text.toString().split(delimiter);
  return parts[parts.length - 1];
}
