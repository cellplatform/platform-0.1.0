import { FilesystemS3 } from '@platform/cell.fs.s3';
import { MongoDb } from '@platform/fsdb.mongo';

import { Server, t, time, rx } from './common';
import { IS_CLOUD, SECRETS } from './constants';
import { NodeRuntime } from '@platform/cell.runtime.node';
import { authorize } from './auth';

/**
 * Cell: FileSystem
 */
const fs = FilesystemS3({
  dir: '__S3_ROOT__',
  endpoint: { origin: '__S3_ORIGIN__', edge: '__S3_EDGE__' },
  accessKey: SECRETS.S3.KEY,
  secret: SECRETS.S3.SECRET,
});

/**
 * Cell: Database
 */
const db: t.IDb = MongoDb.create({
  uri: SECRETS.DB,
  db: IS_CLOUD ? '__DB__' : 'dev',
  collection: IS_CLOUD ? `__COLLECTION__` : 'local',
});

/**
 * Cell: Runtime (Functions)
 */
const bus = rx.bus();
const runtime = NodeRuntime.create({ bus });

/**
 * Cell: System Server.
 */
const name = IS_CLOUD ? '__NAME__' : 'local';
const deployedAt = IS_CLOUD ? '__DEPLOYED_AT__' : time.now.timestamp;
const app = Server.create({ name, db, fs, deployedAt, runtime, authorize });

Server.logger.start({ app });

export default app.server;
