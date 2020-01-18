import { server, util } from './common';
import { NeDb } from '@platform/fsdb.nedb';
import { local, s3 } from '@platform/cell.fs';
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
const getLocalFs = () => local.init({ root: `${TMP}/fs` });

const getRemoteFs = () =>
  s3.init({
    root: 'platform/tmp/test.http',
    endpoint: 'sfo2.digitaloceanspaces.com',
    accessKey: SECRETS.S3.KEY,
    secret: SECRETS.S3.SECRET,
  });

/**
 * Initialize and start the HTTP application server.
 */
const app = server.init({
  title: 'sample',
  db,
  fs: getRemoteFs(), // TEMP 🐷 - revert to local FS.
  // fs: getLocalFs(),
  // log: ['ROUTES'],
});
app.start({ port: 8080 });
