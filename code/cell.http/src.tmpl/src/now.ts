import { s3, local } from '@platform/cell.fs';
import { MongoDb } from '@platform/fsdb.mongo';

import { server, t, time, util } from './common';

const NOW = util.env.value('NOW_REGION');
const IS_CLOUD = NOW !== 'dev1';
const TMP = util.resolve('tmp');
const KEY = {
  DB: 'CELL_MONGO',
  S3: {
    KEY: 'CELL_S3_KEY',
    SECRET: 'CELL_S3_SECRET',
  },
};

/**
 * Pull secrets.
 * See:
 *  - [.env] file when running locally.
 *  - The "env" field in [now.json] file and [zeit/now] secrets in the cloud.
 */
const secrets = {
  db: util.env.value<string>(KEY.DB, { throw: true }),
  s3: {
    key: util.env.value<string>(KEY.S3.KEY, { throw: true }),
    secret: util.env.value<string>(KEY.S3.SECRET, { throw: true }),
  },
};

/**
 * File system.
 */
const fs = s3.init({
  root: '__S3_ROOT__',
  endpoint: '__S3_ENDPOINT__',
  accessKey: secrets.s3.key,
  secret: secrets.s3.secret,
});

/**
 * Connection to a Mongo database.
 */
const db: t.IDb = MongoDb.create({
  uri: secrets.db,
  db: IS_CLOUD ? '__DB__' : 'dev',
  collection: IS_CLOUD ? `__COLLECTION__` : 'local',
});

/**
 * Initialise the HTTP server.
 */
const title = IS_CLOUD ? '__TITLE__' : 'local';
const deployedAt = IS_CLOUD ? '__DEPLOYED_AT__' : time.now.timestamp;
const app = server.init({ title, db, fs, deployedAt });
export default app.server;
