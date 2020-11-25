import { NeDb } from '@platform/fsdb.nedb';
import { local } from '@platform/cell.fs.local';
import { IMicro, IMicroService, micro } from '@platform/micro';

import { util, t, Schema, HttpClient } from '../common';
import { Router } from '..';
import { port as portUtil } from './util.port';

export type IMock = {
  db: t.IDb;
  fs: t.IFileSystem;
  app: IMicro;
  router: t.IRouter;
  service: IMicroService;
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
let count = 0;

/**
 * Mocking object.
 */
export const mock = {
  async reset() {
    const fs = util.fs;
    await fs.remove(PATH.MOCK);
    await fs.remove(PATH.FS);
  },
  async create() {
    return createMock();
  },
};

/**
 * Create a mock server.
 */
export const createMock = async (
  args: { port?: number; runtime?: t.RuntimeEnv } = {},
): Promise<IMock> => {
  const { runtime } = args;

  count++;

  const filename = util.fs.join(PATH.MOCK, `test-${count}.db`);
  const port = args.port || (await portUtil.unused());

  const db = NeDb.create({ filename });
  const fs = local.init({ dir: PATH.FS, fs: util.fs });

  const body = micro.body;
  const router = Router.create({ name: 'Test', db, fs, body, runtime });
  const app = micro.create({ router });
  const service = await app.start({ port, silent: true });

  const urls = Schema.urls(`localhost:${port}`);
  const hostname = urls.hostname;
  const client = HttpClient.create(urls.origin);
  const origin = client.origin;

  const mock: IMock = {
    db,
    fs,
    port,
    app,
    router,
    service,
    filename,
    hostname,
    host: `${hostname}:${port}`,
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
