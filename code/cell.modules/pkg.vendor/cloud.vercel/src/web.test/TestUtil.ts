import { rx, t, Filesystem, Http } from '../web/common';

import { VERCEL_TEST_TOKEN } from '../__SECRET__';

let _fs: undefined | t.Fs;

const Authorization = `Bearer ${VERCEL_TEST_TOKEN}`;
const headers = { Authorization };
const http = Http.create({ headers });

/**
 * Unit-test helpers.
 */
export const TestUtil = {
  bus: rx.bus(),

  /**
   * 💥 SECRET 💥
   *    Be careful, do not deploy.
   */
  token: VERCEL_TEST_TOKEN,
  http,

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
