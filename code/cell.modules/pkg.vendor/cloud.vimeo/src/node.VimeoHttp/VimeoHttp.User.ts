import { t } from './common';
import { toPicture } from './VimeoHttp.Thumbnails';

/**
 * Convert a raw JSON response into a Vimeo {user} object.
 */
export function toVimeoUser(input: t.JsonMap): t.VimeoUser {
  const data = input as any;

  return {
    uri: data.uri,
    name: data.name,
    bio: data.bio || '',
    resourceKey: data.resource_key,
    account: data.account,
    createdAt: data.created_time,
    picture: toPicture(data.pictures),
    url: { profile: data.link },
    uploadQuota: toUploadQuota(data.upload_quota),
  };
}

export function toUploadQuota(input: t.JsonMap): t.VimeoUploadQuota {
  const data = input as any;
  const toBytes = (input: number | null) => (typeof input === 'number' ? input : -1);
  return {
    space: {
      free: toBytes(data.space.free),
      max: toBytes(data.space.max),
      used: toBytes(data.space.used),
      showing: data.space.showing,
    },
    periodic: {
      free: toBytes(data.periodic.free),
      max: toBytes(data.periodic.max),
      used: toBytes(data.periodic.used),
      resetsAt: data.periodic.reset_date,
    },
    lifetime: {
      free: toBytes(data.lifetime.free),
      max: toBytes(data.lifetime.max),
      used: toBytes(data.lifetime.used),
    },
  };
}
