import * as shortid from './shortid';
import * as cuid from './cuid';

export const id = {
  /**
   * Creates a short non-sequental identifier.
   *    Wrapper around the `shortid` NPM module.
   *    https://www.npmjs.com/package/shortid
   */
  shortid() {
    return shortid.generate();
  },

  /**
   * Creates a CUID (collision-resistant id).
   *    Wrapper around the `cuid` NPM module.
   *    https://github.com/ericelliott/cuid
   */
  cuid() {
    return cuid.generate();
  },
};
