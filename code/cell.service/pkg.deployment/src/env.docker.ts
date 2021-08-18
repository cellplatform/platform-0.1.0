import { FsLocal } from '@platform/cell.fs.local';
import { NeDb } from '@platform/fsdb.nedb';
import { NodeRuntime } from '@platform/cell.runtime.node';

import { Server, util, rx } from './common';
import { authorize } from './auth';

const env = process.env;
const datadir = util.resolve('./.data');

// NB: Docker passes these "termination signals" to the container upon closing.
const exitOnSignal = (signal: string) => process.on(signal, () => process.exit(1));
exitOnSignal('SIGINT');
exitOnSignal('SIGTERM');

/**
 * Database.
 */
const filename = `${datadir}/${env.DB_FILENAME || 'sample.db'}`;
const db = NeDb.create({ filename });

/**
 * File system.
 */
const fs = FsLocal({ dir: `${datadir}/${env.FS_FILENAME || 'sample.fs'}`, fs: util.fs });

/**
 * Function Runtime.
 */
const bus = rx.bus();
const runtime = NodeRuntime.create({ bus });

/**
 * Initialize and start the HTTP application server.
 */
const app = Server.create({
  name: env.SERVER_NAME || 'sample',
  db,
  fs,
  runtime,
  authorize,
});

app.start({ port: env.PORT || 5000 });
Server.logger.start({ app });
