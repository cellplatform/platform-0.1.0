import { AWS, fs, t, formatETag, toContentType } from '../common';

/**
 * Write a file to S3.
 */
export async function put(args: {
  s3: AWS.S3;
  source: string | Buffer;
  bucket: string;
  key: string;
  acl?: t.S3Permissions;
  contentType?: string;
}): Promise<t.S3PutResponse> {
  const { s3, bucket, key } = args;
  const Body = typeof args.source === 'string' ? await fs.readFile(args.source) : args.source;

  try {
    const ContentType = args.contentType || toContentType(key);
    const res = await s3
      .upload({
        Bucket: bucket,
        Key: key,
        Body,
        ACL: args.acl,
        ContentType,
      })
      .promise();
    const url = res.Location;
    const etag = formatETag(res.ETag);
    return { ok: true, status: 200, key, bucket, url, etag };
  } catch (err) {
    const status = err.statusCode;
    const error = new Error(err.code);
    return { ok: false, status, key, bucket, error };
  }
}
