import * as t from '../src/types';
import * as dotenv from 'dotenv';
dotenv.config();

export { t };
export { bundler } from '../src';
export * from '../src/common';

import { fs } from '../src/common';

const ACCESS = {
  KEY: process.env.SPACES_KEY,
  SECRET: process.env.SPACES_SECRET,
};

export const s3 = fs.s3({
  endpoint: 'sfo2.digitaloceanspaces.com',
  accessKey: ACCESS.KEY,
  secret: ACCESS.SECRET,
});

export async function lastDir(parentDir: string) {
  parentDir = fs.resolve(parentDir);
  const dirs = await fs.glob.find(fs.join(parentDir, '*'), { type: 'DIRS' });
  return dirs[dirs.length - 1];
}
