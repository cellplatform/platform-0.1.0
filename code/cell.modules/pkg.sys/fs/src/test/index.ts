export { expect } from '@platform/test';
export * from '../web/common';

import { fs } from '@platform/fs';
import { FilesystemLocal } from '@platform/cell.fs.local';
import { Hash } from '../web/common';

const tmp = fs.resolve('tmp');

export const TestFs = {
  tmp,
  node: fs,
  local: FilesystemLocal({ dir: fs.join(tmp, 'root'), fs }),
  FilesystemLocal,
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
