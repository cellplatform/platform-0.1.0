import { lastPart } from './common';

/**
 * Keys for items within the grid.
 */
export class GridSchema {
  public static create = (args: {}) => new GridSchema(args);
  private constructor(args: {}) {}

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
