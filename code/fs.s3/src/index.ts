import { S3 } from './types';
export * from './types';
import { fs as base } from '@platform/fs';

import * as s3 from './s3';
export { s3 };

export const fs = {
  ...base,
  s3(args: { accessKey: string; secret: string; endpoint: string }): S3 {
    return s3.init(args);
  },
};
