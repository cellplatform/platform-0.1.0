import { value, t, http, fs } from '../server/common';
import { createMock, IMock } from './mock';

/**
 * Reads a resolved file-path.
 */
export function readFile(path: string) {
  return fs.readFile(fs.resolve(path));
}

/**
 * Walks an object tree stripping hash values.
 */
export function stripHashes(input: object) {
  if (input) {
    value.object.walk(input, obj => delete obj.hash);
  }
  return input;
}

/**
 * Helpers for posting to a mock.
 */
export const post = {
  /**
   * POST namespace data.
   */
  async ns(url: string, body: t.IReqPostNsBody, options: { mock?: IMock } = {}) {
    const mock = options.mock || (await createMock());
    const res = await http.post(mock.url(url), body);
    const json = res.json as t.IResPostNs;
    if (!options.mock) {
      await mock.dispose();
    }
    return { res, json, data: json.data };
  },
};
