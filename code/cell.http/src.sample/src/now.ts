import { t, server, log, fs, now } from './common';
import { MongoDb } from '@platform/fsdb.mongo';

// server.config()

const region = fs.env.value('NOW_REGION');
const isCloud = typeof region === 'string' && region.length > 0 && !region.startsWith('dev');
const isDev = !isCloud;

/**
 * Connection string to Mongo database.
 * See:
 *  - [.env] file when running locally.
 *  - The "env" field in [now.json] file and [zeit/now] secrets in the cloud.
 */
const KEY = 'PLATFORM_MONGO';
const uri = fs.env.value<string>(KEY, { throw: true }); // See [.env] file when running locally.
log.info(`Mongo Connection: process.env.${KEY}`);

/**
 * Connection to a hosted Mongo database.
 */
const db: t.IDb = MongoDb.create({
  uri,
  db: isDev ? 'dev' : 'test',
  collection: `cell.http`,
});

/**
 * Initialise the HTTP server.
 */
const app = server.init({ title: 'Platform (Sample)', db });
export default app.server;
