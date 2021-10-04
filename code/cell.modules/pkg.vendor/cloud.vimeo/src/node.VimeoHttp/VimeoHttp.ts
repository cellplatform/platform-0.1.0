import { t, Http, toVimeoError } from './common';
import { VimeoHttpThumbnails } from './VimeoHttp.Thumbnails';
import { toVimeoUser } from './VimeoHttp.User';

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
    async me() {
      const url = 'https://api.vimeo.com/me';
      const res = await http.get(url, { headers });
      const json = res.json as any;

      // Error.
      if (!res.ok) {
        const { status } = res;
        const message = `Failed to retrieve authenticated user (check your auth token)`;
        const error = toVimeoError(res, message);
        return { status, error };
      }

      const { status } = res;
      const user = toVimeoUser(json);
      return { status, user };
    },

    get thumbnails() {
      return VimeoHttpThumbnails({ ctx });
    },
  };

  return api;
}
