import { rx, t, Filesystem, Http } from '../common';

import { VERCEL_TEST_TOKEN } from '../__SECRET__';

let _fs: undefined | t.Fs;

/**
 * TODO 🐷 Clearn Up
 */

const Authorization = `Bearer ${VERCEL_TEST_TOKEN}`;
const headers = { Authorization };
const http = Http.create({ headers });

/**
 * Unit-test helpers.
 */
export const TestUtil = {
  /**
   * 💥 SECRET 💥
   *    Be careful, do not deploy.
   */
  token: VERCEL_TEST_TOKEN,
  http,
};
