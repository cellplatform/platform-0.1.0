import { t, toVimeoError } from './common';

/**
 * Wrapper around the "thumbnails" HTTP/API.
 * See:
 *    https://developer.vimeo.com/api/reference/videos#thumbnails
 */
export function VimeoHttpThumbnails(args: { ctx: t.Ctx }): t.VimeoHttpThumbnails {
  const { http, headers } = args.ctx;

  const api: t.VimeoHttpThumbnails = {
    /**
     * Retrieve list of thumbnails.
     */
    async list(video) {
      const url = `https://api.vimeo.com/videos/${video}/pictures`;
      const res = await http.get(url, { headers });
      const json = res.json as any;

      // Error.
      if (!res.ok) {
        const { status } = res;
        const message = `Failed to retrieve thumbnails for video '${video}'`;
        const error = toVimeoError(res, message);
        return { status, video, error, thumbnails: [] };
      }

      const { status } = res;
      const thumbnails: t.VimeoPicture[] = (json.data || []).map(toPicture);
      return { status, video, thumbnails };
    },

    /**
     * Retrieve a single thumbnail.
     */
    async get(video, picture) {
      const url = `https://api.vimeo.com/videos/${video}/pictures/${picture}`;
      const res = await http.get(url, { headers });
      const json = res.json as any;

      // Error.
      if (!res.ok || !json) {
        const { status } = res;
        const message = `Failed to retrieve thumbnail '${picture}' for video '${video}'`;
        const error = toVimeoError(res, message);
        return { status, video, error };
      }

      const { status } = res;
      const thumbnail = toPicture(json);
      return { status, video, thumbnail };
    },
  };

  return api;
}

export const toPicture = (input: t.JsonMap): t.VimeoPicture => {
  const data = input as any;
  return {
    uri: data.uri,
    type: data.type,
    isActive: data.active,
    isDefault: data.default_picture,
    baseLink: data.base_link,
    resourceKey: data.resource_key,
    sizes: data.sizes.map(toSize),
  };
};

const toSize = (item: any): t.VimeoPictureSize => {
  const { width, height, link } = item;
  return { width, height, link };
};
