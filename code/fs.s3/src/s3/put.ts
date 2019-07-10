import { AWS, fs, t, formatETag } from '../common';

/**
 * Write a file to S3.
 */
export async function put(args: {
  s3: AWS.S3;
  source: string | Buffer;
  bucket: string;
  key: string;
  acl?: t.S3Permissions;
}): Promise<t.S3PutResponse> {
  const { s3, bucket, key } = args;
  const Body = typeof args.source === 'string' ? await fs.readFile(args.source) : args.source;
  try {
    const res = await s3.upload({ Bucket: bucket, Key: key, Body, ACL: args.acl }).promise();
    const url = res.Location;
    const etag = formatETag(res.ETag);
    return { ok: true, key, bucket, url, etag };
  } catch (error) {
    return { ok: false, key, bucket, error };
  }
}
