import { local } from '@platform/cell.fs.local';
import { s3 } from '@platform/cell.fs.s3';
import { NeDb } from '@platform/fsdb.nedb';

import { server, util } from './common';

util.env.load();
const TMP = util.resolve('tmp');

/**
 * Database.
 */
const filename = `${TMP}/sample.db`;
const db = NeDb.create({ filename });

/**
 * File system.
 */

const filesystem = {
  local: () => local.init({ dir: `${TMP}/fs`, fs: util.fs }),

  spaces: () =>
    s3.init({
      dir: 'platform/tmp/test.http',
      endpoint: {
        origin: 'sfo2.digitaloceanspaces.com',
        edge: 'sfo2.cdn.digitaloceanspaces.com',
      },
      accessKey: util.env.value('SPACES_KEY'),
      secret: util.env.value('SPACES_SECRET'),
    }),

  wasabi: () =>
    s3.init({
      dir: 'cell/tmp/test.http',
      endpoint: 's3.us-west-1.wasabisys.com',
      accessKey: util.env.value('WASABI_KEY'),
      secret: util.env.value('WASABI_SECRET'),
    }),
};

/**
 * Initialize and start the HTTP application server.
 */
const app = server.create({
  name: 'sample',
  db,
  fs: filesystem.spaces(),
  // fs: filesystem.wasabi(),
  // fs: filesystem.local(),
});

app.start({ port: 8080 });
server.logger.start({ app });
