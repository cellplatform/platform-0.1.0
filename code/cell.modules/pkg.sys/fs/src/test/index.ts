export { expect } from '@platform/test';
export * from '../web/common';

import { fs } from '@platform/fs';
import { FsLocal, FsIndexer } from '@platform/cell.fs.local';

import { Hash } from '../web/common';

const tmp = fs.resolve('tmp');

export const TestFs = {
  FsLocal,
  FsIndexer,

  tmp,
  node: fs,
  local: FsLocal({ dir: fs.join(tmp, 'root'), fs }),
  index: (dir: string) => FsIndexer({ dir, fs }),
  reset: () => fs.remove(tmp),

  join: fs.join,
  resolve: fs.resolve,
  exists: fs.pathExists,

  async readFile(path: string) {
    path = fs.resolve(path);
    const buffer = await fs.readFile(path);
    const data = buffer as Uint8Array;
    const hash = Hash.sha256(data);
    return { path, data, hash };
  },
};
