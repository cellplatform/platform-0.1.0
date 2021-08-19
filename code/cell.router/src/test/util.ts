import { value, t, http } from '../common';
import { createMock, IMock } from './Mock';

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
export const TestPost = {
  /**
   * POST namespace data.
   */
  async ns(url: string, body: t.IReqPostNsBody, options: { mock?: IMock } = {}) {
    const mock = options.mock || (await createMock());
    const response = await http.post(mock.url(url), body);
    const json = response.json as t.IResPostNs;
    const data = json.data;
    if (!options.mock) await mock.dispose();
    return { response, json, data };
  },
};
