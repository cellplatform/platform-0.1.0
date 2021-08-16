export { expect } from '@platform/test';
export * from '../node/common';

import { fs } from '@platform/fs';
import { LocalFilesystem } from '@platform/cell.fs.local';
import { Hash } from '@platform/cell.schema';

const tmp = fs.resolve('tmp');

export const TestFs = {
  tmp,
  node: fs,
  local: LocalFilesystem({ dir: fs.join(tmp, 'root'), fs }),
  LocalFilesystem,
  reset: () => fs.remove(tmp),

  join: fs.join,
  resolve: fs.resolve,
  exists: fs.pathExists,

  async readFile(path: string) {
    path = fs.resolve(path);
    const { buffer } = await fs.readFile(path);
    const data = new Uint8Array(buffer);
    const hash = Hash.sha256(data);
    return { path, data, hash };
  },
};
