import { Http, t } from './common';
import { VimeoHttpThumbnails } from './VimeoHttp.Thumbnails';
import { VimeoHttpUpload } from './VimeoHttp.Upload';
import { getMe } from './VimeoHttp.User';

/**
 * A wrapper around the Vimeo HTTP endpoint.
 * See:
 *    https://developer.vimeo.com/api/reference
 */
export function VimeoHttp(args: {
  token: string;
  fs: t.Fs;
  convertUploadFile: t.ConvertUploadFile;
  http?: t.Http;
}): t.VimeoHttp {
  const { fs, convertUploadFile } = args;
  const headers = {
    Authorization: `bearer ${args.token}`,
    'Content-Type': 'application/json',
  };
  const http = args.http ?? Http.create();
  const ctx: t.HttpCtx = { fs, http, headers };

  const api: t.VimeoHttp = {
    get thumbnails() {
      return VimeoHttpThumbnails({ ctx });
    },

    upload(source, props = {}) {
      return VimeoHttpUpload({ ctx, source, props, convertUploadFile });
    },

    async me() {
      return getMe({ ctx });
    },
  };

  return api;
}
