import { local } from '@platform/cell.fs';
import { NeDb } from '@platform/fsdb.nedb';
import { server } from '@platform/cell.http/lib/server';
import { fs, t } from './common';

/**
 * Configure and initialize a CellOS http server.
 */
export function createServer() {
  console.log('log - init server');

  const dir = fs.resolve('tmp');
  const filename = `${dir}/local.db`;
  const db = NeDb.create({ filename });

  console.log('filename', filename);

  const app = server.init({
    title: 'local',
    db,
    fs: local.init({ root: `${dir}/fs` }),
    // log: ['ROUTES'],
  });

  return { app };
}

/**
 * Initialize and start a CellOS http server.
 */
export async function startServer() {
  const { app } = createServer();

  const port = 8080;
  const instance = await app.start({ port });

  return { app, instance };
}
