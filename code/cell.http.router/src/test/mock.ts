import { NeDb } from '@platform/fsdb.nedb';
import { local } from '@platform/cell.fs.local';
import { IMicro, IMicroService, micro } from '@platform/micro';

import { util, t, Schema, HttpClient } from '../common';
import { CellRouter } from '..';

export type IMock = {
  db: t.IDb;
  fs: t.IFileSystem;
  app: IMicro;
  router: t.IRouter;
  service: IMicroService;
  filename: string;
  host: string;
  port: number;
  origin: string;
  url: (path: string) => string;
  urls: t.IUrls;
  client: t.IHttpClient;
  dispose(args?: { delete?: boolean }): Promise<void>;
};

const TMP = util.fs.resolve('tmp');
const PATH = {
  TMP,
  FS: util.fs.join(TMP, 'fs'),
};
let count = 0;

/**
 * Mocking object.
 */
export const mock = {
  async reset() {
    await util.fs.remove(TMP);
  },
  async create() {
    return createMock();
  },
};

/**
 * Create a mock server.
 */
export const createMock = async (args: { port?: number } = {}): Promise<IMock> => {
  count++;
  const filename = util.fs.join(TMP, `mock/test-${count}.db`);
  const port = args.port || randomPort();

  const db = NeDb.create({ filename });
  const fs = local.init({ root: PATH.FS, fs: util.fs });

  const body = micro.body;
  const router = CellRouter.create({ title: 'Test', db, fs, body });
  const app = micro.create({ router });
  const service = await app.start({ port, silent: true });

  const urls = Schema.urls(`localhost:${port}`);
  const host = urls.host;
  const client = HttpClient.create(urls.origin);
  const origin = client.origin;

  const mock: IMock = {
    db,
    fs: fs,
    port,
    app,
    router,
    service,
    filename,
    host,
    origin,
    url: (path: string) => `http://localhost:${port}/${path.replace(/^\/*/, '')}`,
    urls,
    client,
    async dispose(args: { delete?: boolean } = {}) {
      await tryIgnore(() => db.dispose());
      await tryIgnore(() => app.stop());
      if (args.delete) {
        await tryIgnore(() => util.fs.remove(filename));
      }
    },
  };
  return mock;
};

const tryIgnore = async (fn: () => any) => {
  try {
    await fn();
  } catch (error) {
    // Ignore.
  }
};

/**
 * [Helpers]
 */

/**
 * Generates a randon port number.
 * See:
 *    https://en.wikipedia.org/wiki/List_of_TCP_and_UDP_port_numbers#Dynamic,_private_or_ephemeral_ports
 */
const randomPort = () => {
  const MIN = 49152;
  const MAX = 65535;
  return util.value.random(MIN, MAX);
};
