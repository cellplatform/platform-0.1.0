import { NeDb } from '@platform/fsdb.nedb';
import { local } from '@platform/cell.fs/lib/fs.local';
import { IRouter } from '@platform/http.router';

import { server } from '../server';
import { t, Schema, HttpClient, fs as filesystem, value } from '../common';

export type IMock = {
  db: t.IDb;
  fs: t.IFileSystem;
  port: number;
  app: t.IMicro;
  router: IRouter;
  service: t.IMicroService;
  filename: string;
  host: string;
  url: (path: string) => string;
  urls: t.IUrls;
  client: t.IHttpClient;
  dispose(args?: { delete?: boolean }): Promise<void>;
};

const TMP = filesystem.resolve('tmp');
const PATH = {
  TMP,
  FS: filesystem.join(TMP, 'fs'),
};
let count = 0;

/**
 * Mocking object.
 */
export const mock = {
  async reset() {
    await filesystem.remove(TMP);
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
  const filename = filesystem.join(TMP, `mock/test-${count}.db`);
  const port = args.port || randomPort();

  const db = NeDb.create({ filename });
  const cellFs = local.init({ root: PATH.FS });

  const app = server.create({ title: 'Test', db, fs: cellFs });
  const router = app.router;
  const service = await app.start({ port, silent: true });

  const urls = Schema.urls(`localhost:${port}`);
  const host = urls.host;
  const client = HttpClient.create(urls.origin);

  const mock: IMock = {
    db,
    fs: cellFs,
    port,
    app,
    router,
    service,
    filename,
    host,
    url: (path: string) => `http://localhost:${port}/${path.replace(/^\/*/, '')}`,
    urls,
    client,
    async dispose(args: { delete?: boolean } = {}) {
      await tryIgnore(() => db.dispose());
      await tryIgnore(() => app.stop());
      if (args.delete) {
        await tryIgnore(() => filesystem.remove(filename));
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

const randomPort = () => {
  const random = (min = 0, max = 9) => value.random(min, max);
  return value.toNumber(`${random(6, 9)}${random()}${random()}${random()}`);
};
