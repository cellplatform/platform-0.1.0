import { rx, t, Filesystem, Http, slug } from '../common';
import { Token } from './TestUtil.Token';

let _fs: undefined | t.Fs;
const bus = rx.bus();

/**
 * Unit-test helpers.
 */
export const TestUtil = {
  bus,
  Token,

  get token() {
    return Token.read();
  },

  get http() {
    const headers = Token.headers;
    return Http.create({ headers });
  },

  /**
   * Filesystem
   */
  fs: {
    id: 'fs:dev.tests',
    ready: false,
    get instance() {
      const bus = TestUtil.bus;
      const fs = TestUtil.fs.id;
      return { bus, id: `instance.foo`, fs };
    },
    get events() {
      const id = TestUtil.fs.id;
      return _fs || (_fs = Filesystem.Events({ bus, id }).fs());
    },
    async init() {
      if (!TestUtil.fs.ready) {
        const id = TestUtil.fs.id;
        await Filesystem.IndexedDb.create({ bus, id });
        TestUtil.fs.ready = true;
      }
      return TestUtil.fs.events;
    },
  },
};
