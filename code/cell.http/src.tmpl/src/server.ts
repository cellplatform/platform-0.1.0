/* eslint-disable */

import { local } from '@platform/cell.fs.local';
import { s3 } from '@platform/cell.fs.s3';
import { NeDb } from '@platform/fsdb.nedb';

import { server, util } from './common';
import { SECRETS } from './constants';

const TMP = util.resolve('tmp');

/**
 * Database.
 */
const filename = `${TMP}/sample.db`;
const db = NeDb.create({ filename });

/**
 * File system.
 */
// const getFsLocal = () => local.init({ dir: `${TMP}/fs`, fs: util.fs });

const fs = {
  local: () => local.init({ dir: `${TMP}/fs`, fs: util.fs }),

  spaces: () =>
    s3.init({
      dir: 'platform/tmp/test.http',
      endpoint: 'sfo2.digitaloceanspaces.com',
      accessKey: SECRETS.S3.KEY,
      secret: SECRETS.S3.SECRET,
    }),

  wasabi: () =>
    s3.init({
      dir: 'cell/tmp/test.http',
      endpoint: 's3.us-west-1.wasabisys.com',
      accessKey: SECRETS.S3.KEY,
      secret: SECRETS.S3.SECRET,
    }),
};

/**
 * Initialize and start the HTTP application server.
 */
const app = server.create({
  name: 'sample',
  db,
  fs: fs.spaces(), // TEMP 🐷 - revert to local FS.
  // fs: fs.local(),
  // log: ['ROUTES'],
});

app.start({ port: 8080 });
server.logger.start({ app });
