import { AWS, t, util } from '../common';

/**
 * Write a file to S3 using PUT.
 */
export async function put(args: t.S3PutArgs & { s3: AWS.S3 }): Promise<t.S3PutResponse> {
  const { s3, bucket, key } = args;
  const url = util.toObjectUrl({ s3, bucket, path: key });
  const contentType = args.contentType || util.toContentType(key, 'application/octet-stream');

  const done = (status: number, options: { etag?: string; error?: Error } = {}) => {
    const ok = util.isOK(status);
    const etag = util.formatETag(options.etag);
    const error = options.error;
    return { ok, status, key, bucket, url, contentType, etag, error };
  };

  if (!args.data) {
    const error = new Error(`No data provided.`);
    return done(400, { error });
  }

  try {
    const res = await s3
      .upload({
        Bucket: bucket,
        Key: key,
        Body: args.data,
        ACL: args.acl,
        ContentType: contentType,
        ContentDisposition: args.contentDisposition,
      })
      .promise();
    const etag = res.ETag;
    return done(200, { etag });
  } catch (err) {
    const status = err.statusCode || 500;
    const error = new Error(err.code);
    return done(status, { error });
  }
}
