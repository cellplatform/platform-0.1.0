import { local } from '@platform/cell.fs';
import { NeDb } from '@platform/fsdb.nedb';
import { server } from '@platform/cell.http/lib/server';
import { fs, t } from './common';

/**
 * Configure and initialize a CellOS http server.
 */
export function init() {
  const dir = fs.resolve('tmp');
  const filename = `${dir}/local.db`;
  const db = NeDb.create({ filename });

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
export async function start() {
  const { app } = init();

  const port = 8080;
  const instance = await app.start({ port });

  return { app, instance };
}
