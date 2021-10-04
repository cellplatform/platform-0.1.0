import { t } from './common';

/**
 * A wrapper around the Thumbnails HTTP/API.
 * See:
 *    https://developer.vimeo.com/api/reference/videos#thumbnails
 */
export function VimeoHttpThumbnails(args: { ctx: t.Ctx }): t.VimeoHttpThumbnails {
  const { ctx } = args;
  const { http, headers } = ctx;

  const toSize = (item: any): t.VimeoThumbnailSize => {
    const { width, height, link } = item;
    return { width, height, link };
  };

  const toThumbnail = (data: any): t.VimeoThumbnail => {
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

  const api: t.VimeoHttpThumbnails = {
    /**
     * Retrieve list of thumbnails.
     */
    async list(video) {
      const url = `https://api.vimeo.com/videos/${video}/pictures`;
      const res = await http.get(url, { headers });
      const json = res.json as any;

      // Error.
      if (!res.ok || !json) {
        const { status, statusText } = res;
        const error = `Failed to retrieve thumbnails for video '${video}'. ${statusText}`.trim();
        return { status, video, error, thumbnails: [] };
      }

      const { status } = res;
      const thumbnails: t.VimeoThumbnail[] = (json.data || []).map(toThumbnail);
      return { status, video, thumbnails };
    },

    /**
     * Retrieve a sigle thumbnail
     */
    async get(video, picture) {
      const url = `https://api.vimeo.com/videos/${video}/pictures/${picture}`;
      const res = await http.get(url, { headers });
      const json = res.json as any;

      // Error.
      if (!res.ok || !json) {
        const { status, statusText } = res;
        const error = `Failed to retrieve thumbnail '${picture}' for video '${video}'. ${statusText}`;
        return { status, video, error: error.trim() };
      }

      const { status } = res;
      const thumbnail = toThumbnail(json);
      return { status, video, thumbnail };
    },
  };

  return api;
}
