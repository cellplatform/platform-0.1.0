import { t, server, log, util } from './common';
import { MongoDb } from '@platform/fsdb.mongo';
import { local } from '@platform/cell.fs';

const NOW = util.env.value('NOW_REGION');
const IS_CLOUD = NOW !== 'dev1';
const TMP = util.resolve('tmp');

/**
 * Connection string to Mongo database.
 * See:
 *  - [.env] file when running locally.
 *  - The "env" field in [now.json] file and [zeit/now] secrets in the cloud.
 */
const KEY_DB = 'CELL_MONGO';
const uri = util.env.value<string>(KEY_DB, { throw: true }); // See [.env] file when running locally.

/**
 * File system.
 */
const fs = local.init({ root: `${TMP}/fs` }); // TODO 🐷 Make this S3

/**
 * Connection to a Mongo database.
 */
const db: t.IDb = MongoDb.create({
  uri,
  db: IS_CLOUD ? '__DB__' : 'dev',
  collection: IS_CLOUD ? `__COLLECTION__` : 'local',
});

/**
 * Initialise the HTTP server.
 */
const title = IS_CLOUD ? '__TITLE__' : 'local';
const app = server.init({ title, db, fs });
export default app.server;
