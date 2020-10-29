import { fs } from '@platform/fs';
import { log } from '@platform/log/lib/server';

export { fs, log };
export const NODE_MODULES = fs.resolve('../../../../node_modules');
