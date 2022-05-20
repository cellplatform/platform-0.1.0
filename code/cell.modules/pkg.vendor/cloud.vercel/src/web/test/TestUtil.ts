import { rx, t, Filesystem, Http } from '../common';
import { Token } from './TestUtil.Token';

let _fs: undefined | t.Fs;

/**
 * Unit-test helpers.
 */
export const TestUtil = {
  bus: rx.bus(),
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
    ready: false,
    get instance() {
      const bus = TestUtil.bus;
      return { bus, id: 'fs:dev.tests' };
    },
    get events() {
      return _fs || (_fs = Filesystem.Events(TestUtil.fs.instance).fs());
    },
    async init() {
      if (!TestUtil.fs.ready) {
        await Filesystem.create(TestUtil.fs.instance);
        TestUtil.fs.ready = true;
      }
      return TestUtil.fs.events;
    },
  },
};
