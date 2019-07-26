import { coord, lastPart, t, toList, toMap } from './common';

/**
 * Keys for items within the grid.
 */
export class GridSchema {
  public static create = (args: {}) => new GridSchema(args);
  private constructor(args: {}) {}

  /**
   * [Methods]
   */

  public toKey(key: string) {
    return lastPart(key, '/').toUpperCase();
  }

  public toCellKey(key: string) {
    return lastPart(key, '/').toUpperCase();
  }

  public toColumnKey(indexOrKey: number | string) {
    return typeof indexOrKey === 'number'
      ? coord.cell.toKey(indexOrKey, undefined)
      : lastPart(indexOrKey, '/');
  }

  public toRowKey(indexOrKey: number | string) {
    return typeof indexOrKey === 'number'
      ? coord.cell.toKey(undefined, indexOrKey)
      : lastPart(indexOrKey, '/');
  }

  /**
   * [Helpers]
   */
  public toList = (map: t.Map) => toList(map, key => this.toKey(key));
  public toMap = (list: t.List) => toMap(list, key => this.toKey(key));
}
