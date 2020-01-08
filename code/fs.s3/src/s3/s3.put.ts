import { AWS, fs, t, util } from '../common';

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
  contentDisposition?: string;
}): Promise<t.S3PutResponse> {
  const { s3, bucket, key } = args;
  const Body = typeof args.source === 'string' ? await fs.readFile(args.source) : args.source;
  const url = util.toObjectUrl({ s3, bucket, path: key });
  const contentType = args.contentType || util.toContentType(key, 'application/octet-stream');
  try {
    const res = await s3
      .upload({
        Bucket: bucket,
        Key: key,
        Body,
        ACL: args.acl,
        ContentType: contentType,
        ContentDisposition: args.contentDisposition,
      })
      .promise();
    const etag = util.formatETag(res.ETag);
    return { ok: true, status: 200, key, bucket, url, contentType, etag };
  } catch (err) {
    const status = err.statusCode;
    const error = new Error(err.code);
    return { ok: false, status, key, bucket, url, contentType, etag: '', error };
  }
}
