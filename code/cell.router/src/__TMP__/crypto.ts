import * as nodeCrypto from 'crypto';

/**
 * Helpers for working with the [node] crypto library.
 */
export const crypto = {
  /**
   * Generates cryptographically strong pseudo-random data.
   * See
   *    https://nodejs.org/api/crypto.html#crypto_crypto_randombytes_size_callback
   */
  random(length: number) {
    return new Promise<string>((resolve, reject) => {
      nodeCrypto.randomBytes(length, async (err, buffer) => {
        if (err) {
          reject(err);
        } else {
          resolve(buffer.toString('hex'));
        }
      });
    });
  },
};
