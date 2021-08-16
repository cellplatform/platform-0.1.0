export { expect } from '@platform/test';
export * from '../node/common';

import { fs } from '@platform/fs';
import { LocalFilesystem } from '@platform/cell.fs.local';

const tmp = fs.resolve('tmp');

export const Filesystem = {
  tmp,
  node: fs,
  local: LocalFilesystem({ dir: fs.join(tmp, 'root'), fs }),
  LocalFilesystem,
  reset: () => fs.remove(tmp),
};
