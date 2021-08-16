import * as t from './types';
import { fs } from '@platform/fs';
import { log } from '@platform/log/lib/server';

export { t, fs, log };
export { Server } from '@platform/cell.service/lib/node/server';
export { time, rx } from '@platform/util.value';

export const env = fs.env;
export const resolve = fs.resolve;
export const util = { fs, env, resolve };
