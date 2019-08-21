import { AWS, fs, t, defaultValue, formatTimestamp, formatETag } from '../common';

/**
 * Read objects from S3
 */
export async function list(args: {
  s3: AWS.S3;
  bucket: string;
  prefix?: string;
  max?: number;
}): Promise<t.S3ListResponse> {
  const { s3, bucket, prefix, max } = args;

  const response: t.S3ListResponse = {
    ok: true,
    status: 200,
    prefix: prefix || '',
    max: defaultValue(max, -1),
    items: [],
  };

  const toItem = (data: any): t.S3ListItem => {
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
    // Get list from S3
    const res = await s3.listObjectsV2({ Bucket: bucket, MaxKeys: args.max, Prefix: args.prefix });
    const data = await res.promise();

    // Format results.
    response.max = data.MaxKeys || response.max;
    response.items = (data.Contents as any[]).map(data => toItem(data));
  } catch (err) {
    const error = new Error(err.code);
    response.status = err.statusCode;
    response.ok = false;
    response.error = error;
  }

  // return {};
  return response;
}
