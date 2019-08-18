import * as t from '../src/types';

export { t };
export { bundler } from '../src';
export * from '../src/common';
export * from '../test/constants';

export const s3: t.IS3Config = {
  endpoint: 'sfo2.digitaloceanspaces.com',
  accessKey: process.env.SPACES_KEY,
  secret: process.env.SPACES_SECRET,
};
