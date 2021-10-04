type Uri = string;
type Url = string;

export type VimeoId = number;
export type VimeoHttpError = string;
export type VimeoHttpResponse = { status: number; error?: VimeoHttpError };

/**
 * Root HTTP wrapper.
 */
export type VimeoHttp = {
  thumbnails: VimeoHttpThumbnails;
};

/**
 * Thumbnails
 * https://developer.vimeo.com/api/reference/videos#thumbnails
 */

export type VimeoHttpThumbnails = {
  list(id: VimeoId): Promise<VimeoHttpThumbnailListResponse>;
  get(id: VimeoId, picture: VimeoId): Promise<VimeoHttpThumbnailResponse>;
};

export type VimeoHttpThumbnailListResponse = VimeoHttpResponse & {
  video: VimeoId;
  thumbnails: VimeoThumbnail[];
};

export type VimeoHttpThumbnailResponse = VimeoHttpResponse & {
  video: VimeoId;
  thumbnail?: VimeoThumbnail;
};

export type VimeoThumbnail = {
  uri: Uri;
  type: 'default' | 'custom' | 'caution';
  isActive: boolean;
  isDefault: boolean;
  baseLink: Url;
  resourceKey: string;
  sizes: VimeoThumbnailSize[];
};

export type VimeoThumbnailSize = { width: number; height: number; link: Url };
