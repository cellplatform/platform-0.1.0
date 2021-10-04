import { t, Http } from './common';
import { VimeoHttpThumbnails } from './VimeoHttp.Thumbnails';

/**
 * A wrapper around the Vimeo HTTP endpoint.
 * See:
 *    https://developer.vimeo.com/api/reference
 */
export function VimeoHttp(args: { token: string; http?: t.Http }): t.VimeoHttp {
  const http = args.http ?? Http.create();
  const headers = { Authorization: `bearer ${args.token}` };
  const ctx: t.Ctx = { http, headers };

  const api: t.VimeoHttp = {
    get thumbnails() {
      return VimeoHttpThumbnails({ ctx });
    },
  };

  return api;
}
