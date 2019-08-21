import { AWS, defaultValue, formatETag, formatTimestamp, t } from '../common';

/**
 * Get listings of objects from S3
 */
export function list(args: {
  s3: AWS.S3;
  bucket: string;
  prefix?: string;
  max?: number;
}): t.S3List {
  return {
    get objects() {
      return listObjects(args);
    },
    get dirs() {
      return listDirs(args);
    },
  };
}

/**
 * Query for a list of objects.
 */
export async function listObjects(args: {
  s3: AWS.S3;
  bucket: string;
  prefix?: string;
  max?: number;
}): Promise<t.S3ListObjectsResponse> {
  const { s3, bucket, prefix, max } = args;

  const response: t.S3ListObjectsResponse = {
    ok: true,
    status: 200,
    prefix: prefix || '',
    max: defaultValue(max, -1),
    items: [],
  };

  const toItem = (data: any): t.S3ListObject => {
    const owner = data.Owner || {};
    return {
      key: data.Key || '',
      modifiedAt: formatTimestamp(data.LastModified),
      etag: formatETag(data.ETag) || '',
      storage: data.StorageClass || 'STANDARD',
      owner: {
        id: owner.ID || '',
        displayName: owner.DisplayName || '',
      },
    };
  };

  try {
    // Get list from S3.
    const res = await s3.listObjectsV2({
      Bucket: bucket,
      MaxKeys: args.max,
      Prefix: args.prefix,
    });
    const data = await res.promise();

    // Format results.
    response.max = data.MaxKeys || response.max;
    response.items = (data.Contents as any[])
      .map(data => toItem(data))
      .filter(item => !item.key.endsWith('/')); // NB: Don't include containers (eg. "dirs").  See `dirs` listing method below.
  } catch (err) {
    const error = new Error(err.code);
    response.status = err.statusCode;
    response.ok = false;
    response.error = error;
  }

  // Finish up.
  return response;
}

/**
 * Query for a list of object containers ("dir").
 */
export async function listDirs(args: {
  s3: AWS.S3;
  bucket: string;
  prefix?: string;
  max?: number;
}): Promise<t.S3ListDirsResponse> {
  const { s3, bucket, prefix, max } = args;

  const response: t.S3ListDirsResponse = {
    ok: true,
    status: 200,
    prefix: prefix || '',
    max: defaultValue(max, -1),
    items: [],
  };

  const toItem = (data: any): t.S3ListDir => {
    const key = data.Prefix.replace(/\/$/, '');
    return { key };
  };

  try {
    // Get list from S3.
    const Prefix = args.prefix ? `${args.prefix.replace(/\/$/, '')}/` : undefined;
    const res = await s3.listObjectsV2({
      Bucket: bucket,
      MaxKeys: args.max,
      Prefix,
      Delimiter: '/',
    });
    const data = await res.promise();

    // Format results.
    response.max = data.MaxKeys || response.max;
    response.items = (data.CommonPrefixes as any[]).map(data => toItem(data));
  } catch (err) {
    const error = new Error(err.code);
    response.status = err.statusCode;
    response.ok = false;
    response.error = error;
  }

  // Finish up.
  return response;
}
