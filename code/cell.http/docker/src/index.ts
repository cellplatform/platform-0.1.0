import { local } from '@platform/cell.fs.local';
import { NeDb } from '@platform/fsdb.nedb';
import { NodeRuntime } from '@platform/cell.runtime/lib/node';

import { server, util } from './common';

util.env.load();
const TMP = util.resolve('tmp');

/**
 * Database.
 */
const filename = `${TMP}/sample.db`;
const db = NeDb.create({ filename });

/**
 * File system.
 */
const filesystem = {
  local: () => local.init({ dir: `${TMP}/fs`, fs: util.fs }),
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
