import { Http, rx } from '../common';
import { TestFilesystem } from './Test.Filesystem';
import { TestToken } from './Test.Token';

const bus = rx.bus();

/**
 * Unit-test helpers.
 */
export const TestUtil = {
  bus,
  Token: TestToken,
  fs: TestFilesystem(bus),

  get token() {
    return TestToken.read();
  },

  get http() {
    const headers = TestToken.headers;
    return Http.create({ headers });
  },
};
