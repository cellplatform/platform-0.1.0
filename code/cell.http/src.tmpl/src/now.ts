import { t, server, log, fs } from './common';
import { MongoDb } from '@platform/fsdb.mongo';

/**
 * Connection string to Mongo database.
 * See:
 *  - [.env] file when running locally.
 *  - The "env" field in [now.json] file and [zeit/now] secrets in the cloud.
 */
const KEY = 'CELLOS_MONGO';
const uri = fs.env.value<string>(KEY, { throw: true }); // See [.env] file when running locally.
log.info(`Mongo Connection: process.env.${KEY}`);

/**
 * Connection to a Mongo database.
 */
const db: t.IDb = MongoDb.create({
  uri,
  db: '__DB__',
  collection: `__COLLECTION__`,
});

/**
 * Initialise the HTTP server.
 */
const app = server.init({ title: '__TITLE__', db });
export default app.server;
