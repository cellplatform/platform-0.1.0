import { s3 } from '@platform/cell.fs';
import { MongoDb } from '@platform/fsdb.mongo';

import { server, t, time } from './common';
import { IS_CLOUD, SECRETS } from './constants';

/**
 * File system.
 */
const fs = s3.init({
  root: '__S3_ROOT__',
  endpoint: '__S3_ENDPOINT__',
  accessKey: SECRETS.S3.KEY,
  secret: SECRETS.S3.SECRET,
});

/**
 * Connection to a Mongo database.
 */
const db: t.IDb = MongoDb.create({
  uri: SECRETS.DB,
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
