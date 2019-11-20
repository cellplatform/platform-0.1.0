import { NeDb } from '@platform/fsdb.nedb';

import { server } from '../server';
import { fs, value } from '../server/common';

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

  return {
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
};

const tryIgnore = async (fn: () => any) => {
  try {
    await fn();
  } catch (error) {
    // Ignore.
  }
};
