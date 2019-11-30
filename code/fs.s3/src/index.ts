import { S3, S3Config } from './types';
export * from './types';
import { fs as base } from '@platform/fs';

import { s3 } from './s3';
export { s3 };

export const fs = {
  ...base,
  s3(args: S3Config): S3 {
    return s3.init(args);
  },
};
