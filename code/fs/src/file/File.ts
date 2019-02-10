import * as util from './util';

/**
 * Immutable helper for working with known file types.
 */
export class File<T> {
  /**
   * `Static helpers`
   */
  public static loadAndParse = util.loadAndParse;
  public static loadAndParseSync = util.loadAndParseSync;
  public static stringifyAndSave = util.stringifyAndSave;
  public static stringifyAndSaveSync = util.stringifyAndSaveSync;

  /**
   * [Constructor]
   */
  private constructor() {}
}
