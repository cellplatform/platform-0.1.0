import * as util from './util';

/**
 * Immutable helper for working with known file types.
 */
export const File = {
  /**
   * `Static helpers`
   */
  loadAndParse: util.loadAndParse,
  loadAndParseSync: util.loadAndParseSync,
  stringifyAndSave: util.stringifyAndSave,
  stringifyAndSaveSync: util.stringifyAndSaveSync,
};
