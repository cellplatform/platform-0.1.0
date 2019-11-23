import { NeDb } from '@platform/fsdb.nedb';

import { server } from '../server';
import { fs, value, t } from '../server/common';

export type IMock = {
  db: t.IDb;
  port: number;
  app: t.IMicro;
  instance: t.IMicroService;
  filename: string;
  url: (path: string) => string;
  dispose(args?: { delete?: boolean }): Promise<void>;
};

const TMP = fs.resolve('tmp');
let count = 0;

export const mock = {
  async reset() {
    await fs.remove(TMP);
  },
  async create() {
    return create();
  },
};

export const createMock = mock.create;

/**
 * Helpers.
 */

const randomPort = () => {
  return value.toNumber(
    `${value.random(6, 9)}${value.random(0, 9)}${value.random(0, 9)}${value.random(0, 9)}`,
  );
};

const create = async (args: { port?: number } = {}) => {
  count++;
  const filename = fs.join(TMP, `mock/test-${count}.db`);
  const port = args.port || randomPort();

  const db = NeDb.create({ filename });
  const app = server.init({ title: 'Test', db });
  const instance = await app.listen({ port, silent: true });

  const mock: IMock = {
    db,
    port,
    app,
    instance,
    filename,
    url: (path: string) => `http://localhost:${port}/${path.replace(/^\/*/, '')}`,
    async dispose(args: { delete?: boolean } = {}) {
      await tryIgnore(() => db.dispose());
      await tryIgnore(() => instance.close());
      if (args.delete) {
        await tryIgnore(() => fs.remove(filename));
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
