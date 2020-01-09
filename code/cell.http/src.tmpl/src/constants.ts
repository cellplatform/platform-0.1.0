import { util } from './common';

export const NOW = process.env.NOW_REGION || 'dev1';
export const IS_CLOUD = NOW !== 'dev1';

if (!IS_CLOUD) {
  util.env.load();
}

export const KEY = {
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
export const SECRETS = {
  DB: util.env.value<string>(KEY.DB, { throw: true }),
  S3: {
    KEY: util.env.value<string>(KEY.S3.KEY, { throw: true }),
    SECRET: util.env.value<string>(KEY.S3.SECRET, { throw: true }),
  },
};
