type Uri = string;
type Url = string;
type IsoDate8601 = string; // ISO 8601 time format.
type Bytes = number;

export type VimeoId = number;
export type VimeoHttpError = { code: number; message: string; detail: string };
export type VimeoHttpResponse = { status: number; error?: VimeoHttpError };
export type ResourceKey = string;

/**
 * Root HTTP wrapper.
 */
export type VimeoHttp = {
  thumbnails: VimeoHttpThumbnails;
  me(): Promise<VimeoHttpMeResponse>;
};

export type VimeoHttpMeResponse = VimeoHttpResponse & { user?: VimeoUser };

/**
 * User
 * https://developer.vimeo.com/api/reference/responses/user
 */

export type VimeoUser = {
  uri: Uri;
  name: string;
  bio: string;
  resourceKey: ResourceKey;
  account: VimeoAccountType;
  createdAt: IsoDate8601;
  picture: VimeoPicture;
  url: { profile: Url };
  uploadQuota: VimeoUploadQuota;
};

export type VimeoAccountType =
  | 'basic'
  | 'business'
  | 'live_business'
  | 'live_premium'
  | 'live_pro'
  | 'plus'
  | 'pro'
  | 'pro_unlimited'
  | 'producer';

export type VimeoUploadQuota = {
  space: { free: Bytes; max: Bytes; used: Bytes; showing: string };
  periodic: { free: Bytes; max: Bytes; used: Bytes; resetsAt: IsoDate8601 };
  lifetime: {};
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
  thumbnails: VimeoPicture[];
};

export type VimeoHttpThumbnailResponse = VimeoHttpResponse & {
  video: VimeoId;
  thumbnail?: VimeoPicture;
};

/**
 * Picture (eg Thumbnail or User)
 */
export type VimeoPicture = {
  uri: Uri;
  type: 'default' | 'custom' | 'caution';
  isActive: boolean;
  isDefault: boolean;
  baseLink: Url;
  resourceKey: ResourceKey;
  sizes: VimeoPictureSize[];
};
export type VimeoPictureSize = { width: number; height: number; link: Url };
