import { local } from '@platform/cell.fs.local';
import { NeDb } from '@platform/fsdb.nedb';
import { NodeRuntime } from '@platform/cell.runtime/lib/node';

import { server, util } from './common';

util.env.load();
const datadir = util.resolve('./.data');

/**
 * Database.
 */
const filename = `${datadir}/sample.db`;
const db = NeDb.create({ filename });

/**
 * File system.
 */
const filesystem = {
  local: () => local.init({ dir: `${datadir}/fs`, fs: util.fs }),
};

/**
 * Function Runtime.
 */
const runtime = NodeRuntime.create();

/**
 * Initialize and start the HTTP application server.
 */
const app = server.create({
  name: 'cell.docker',
  db,
  fs: filesystem.local(),
  runtime,
});

app.start({ port: 8080 });
server.logger.start({ app });

app.router.get('/tmp', async (req) => {
  const fs = util.fs;

  const res = {
    datadir,
  };

  return { data: res };
});
