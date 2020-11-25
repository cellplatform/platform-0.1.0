import { value, t, http } from '../common';
import { createMock, IMock } from './mock';

export * from './util.port';
export * from './util.fs';

/**
 * Walks an object tree stripping hash values.
 */
export function stripHashes(input: Record<string, unknown>) {
  if (input) {
    value.object.walk(input, (obj) => {
      if (typeof obj === 'object' && obj !== null) {
        delete obj.hash;
      }
    });
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
