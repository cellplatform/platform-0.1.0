import { local } from '@platform/cell.fs.local';
import { NeDb } from '@platform/fsdb.nedb';
import { NodeRuntime } from '@platform/cell.runtime/lib/node';

import { server, util } from './common';

util.env.load();
const datadir = util.resolve('./.data');

const env = process.env;

/**
 * Database.
 */
const filename = `${datadir}/${env.DB_FILENAME || 'sample.db'}`;
const db = NeDb.create({ filename });

/**
 * File system.
 */
const fs = local.init({ dir: `${datadir}/${env.FS_FILENAME || 'sample.fs'}`, fs: util.fs });

/**
 * Function Runtime.
 */
const runtime = NodeRuntime.create();

/**
 * Initialize and start the HTTP application server.
 */
const app = server.create({
  name: env.SERVER_NAME || 'sample',
  db,
  fs,
  runtime,
});

app.start({ port: 5000 });
server.logger.start({ app });
