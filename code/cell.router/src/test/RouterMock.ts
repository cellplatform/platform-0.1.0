import { NeDb } from '@platform/fsdb.nedb';
import { FsLocal } from '@platform/cell.fs.local';
import { micro } from '@platform/micro';

import { util, t, Schema, HttpClient, slug } from '../common';
import { Router } from '..';
import { port as portUtil } from './util.port';

export type IRouterMock = {
  db: t.IDb;
  fs: t.IFs;
  app: t.Micro;
  router: t.Router;
  service: t.MicroService;
  filename: string;
  hostname: string;
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
  MOCK: util.fs.join(TMP, 'mock'),
};

/**
 * Mocking object.
 */
export const RouterMock = {
  async reset() {
    const fs = util.fs;
    await fs.remove(PATH.MOCK);
    await fs.remove(PATH.FS);
  },
  async create(args?: CreateArgs) {
    return createMock(args);
  },
};

type CreateArgs = { port?: number; runtime?: t.RuntimeEnv };

/**
 * Create a mock server.
 */
export const createMock = async (args: CreateArgs = {}): Promise<IRouterMock> => {
  const { runtime } = args;

  const filename = util.fs.join(PATH.MOCK, `test-${slug()}.db`);
  const port = args.port || (await portUtil.unused());

  const db = NeDb.create({ filename });
  const fs = FsLocal({ dir: PATH.FS, fs: util.fs });

  const body = micro.body;
  const router = Router.create({ name: 'Test', db, fs, body, runtime });
  const app = micro.create({ router });
  const service = await app.start({ port, silent: true });

  const urls = Schema.urls(`localhost:${port}`);
  const hostname = urls.hostname;
  const host = `${hostname}:${port}`;
  const client = HttpClient.create(urls.origin);
  const origin = client.origin;

  const mock: IRouterMock = {
    db,
    fs,
    port,
    app,
    router,
    service,
    filename,
    hostname,
    host,
    origin,
    url: (path: string) => `http://localhost:${port}/${path.replace(/^\/*/, '')}`,
    urls,
    client,
    async dispose(args: { delete?: boolean } = {}) {
      await tryIgnore(() => db.dispose());
      await tryIgnore(() => app.stop());
      if (args.delete) await tryIgnore(() => util.fs.remove(filename));
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
