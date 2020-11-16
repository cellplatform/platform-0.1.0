import * as t from './types';
import { fs } from '@platform/fs';
import { log } from '@platform/log/lib/server';

export { t, fs, log };
export { server } from '@platform/cell.http/lib/server';
export { time } from '@platform/util.value';

export const resolve = fs.resolve;
export const env = fs.env;
export const util = { fs, env, resolve };

export const formatUrl: t.FsS3FormatUrl = (url, ctx) => {
  if (url.includes('digitaloceanspaces.com')) {
    return ctx.type === 'SIGNED/get' || ctx.type === 'DEFAULT'
      ? url.replace(/digitaloceanspaces\.com/, 'cdn.digitaloceanspaces.com')
      : url;
  } else {
    return url;
  }
};
