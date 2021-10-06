import { t } from '../node/common';
import { VimeoHttp as WebVimeoHttp } from '../web.Http';
import { convertUploadFile } from './util';

/**
 * A wrapper around the Vimeo HTTP endpoint.
 * See:
 *    https://developer.vimeo.com/api/reference
 */
export function VimeoHttp(args: { token: string; fs: t.Fs; http?: t.Http }): t.VimeoHttp {
  const { token, fs, http } = args;
  return WebVimeoHttp({ token, fs, http, convertUploadFile });
}
