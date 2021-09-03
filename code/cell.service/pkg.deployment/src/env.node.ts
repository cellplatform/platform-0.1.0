import { FsDriverLocal } from '@platform/cell.fs.local';
import { FsDriverS3 } from '@platform/cell.fs.s3';
import { NeDb } from '@platform/fsdb.nedb';
import { NodeRuntime } from '@platform/cell.runtime.node';

import { Server, util, rx } from './common';
import { authorize } from './auth';

util.env.load();
const TMP = util.resolve('./tmp/env.node');

/**
 * Database.
 */
const filename = `${TMP}/sample.db`;
const db = NeDb.create({ filename });

/**
 * File system.
 */
const filesystem = {
  local: () => FsDriverLocal({ dir: `${TMP}/fs`, fs: util.fs }),

  spaces: () =>
    FsDriverS3({
      dir: 'platform/tmp/test.http',
      endpoint: {
        origin: 'sfo2.digitaloceanspaces.com',
        edge: 'sfo2.cdn.digitaloceanspaces.com',
      },
      accessKey: util.env.value('SPACES_KEY'),
      secret: util.env.value('SPACES_SECRET'),
    }),

  wasabi: () =>
    FsDriverS3({
      dir: 'cell/tmp/test.http',
      endpoint: 's3.us-west-1.wasabisys.com',
      accessKey: util.env.value('WASABI_KEY'),
      secret: util.env.value('WASABI_SECRET'),
    }),
};

/**
 * Function Runtime.
 */
const bus = rx.bus();
const runtime = NodeRuntime.create({ bus });

/**
 * Initialize and start the HTTP application server.
 */
const app = Server.create({
  name: 'cell.node',
  db,
  runtime,
  // fs: filesystem.local(),
  fs: filesystem.spaces(),
  // fs: filesystem.wasabi(),
  authorize,
});

app.start({ port: 8080 });
Server.logger.start({ app });
