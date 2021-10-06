import { Observable } from 'rxjs';

type Uri = string;
type Url = string;
type IsoDate8601 = string; // ISO 8601 time format.
type Bytes = number;
type FilePath = string;

export type VimeoId = number;
export type VimeoHttpError = { code: number; message: string; detail: string };
export type VimeoHttpResponse = { status: number; error?: VimeoHttpError };
export type ResourceKey = string;

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

export type VimeoLicense =
  | 'by-nc-sa' // Creative Commons: Attribution-NonCommercial-ShareAlike licence.
  | 'by-nd' //    Creative Commons: the Attribution-NoDerivs license.
  | 'by-sa' //    Creative Commons: Attribution-ShareAlike license.
  | 'cc0'; //     Creative Commons: public domain license.

/**
 * Root HTTP wrapper.
 */
export type VimeoHttp = {
  thumbnails: VimeoHttpThumbnails;
  upload: VimeoHttpUpload;
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

export type VimeoUploadQuota = {
  space: { free: Bytes; max: Bytes; used: Bytes; showing: string };
  periodic: { free: Bytes; max: Bytes; used: Bytes; resetAt: IsoDate8601 };
  lifetime: { free: Bytes; max: Bytes; used: Bytes };
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

/**
 * Upload
 */
export type VimeoHttpUpload = (
  source: FilePath,
  options?: VimeoHttpUploadProps,
) => VimeoHttpUploader;

export type VimeoHttpUploader = Promise<VimeoHttpUploaderResponse> & {
  progress$: Observable<VimeoHttpUploadProgress>;
};

export type VimeoHttpUploaderResponse = VimeoHttpResponse & {
  video?: { uri: Uri; url: { manage: Url } };
};

export type VimeoHttpUploadProgress = {
  total: Bytes;
  uploaded: Bytes;
  percent: number;
};

export type VimeoHttpUploadProps = {
  name?: string;
  description?: string;
  mimetype?: string;
  license?: VimeoLicense;
  chunkSize?: Bytes; // The size of each chunk streamed to the server.
};
