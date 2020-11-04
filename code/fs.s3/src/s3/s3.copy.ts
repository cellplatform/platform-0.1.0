import { AWS, t, util } from '../common';

/**
 * Make a copy of an S3 object.
 */
export async function copy(args: t.S3CopyArgs & { s3: AWS.S3 }): Promise<t.S3CopyResponse> {
  const { s3, source, target } = args;

  const done = (status: number, options: { error?: Error; etag?: string } = {}) => {
    const ok = util.isOK(status);
    const { error, etag } = options;
    return { ok, status, source, target, etag, error };
  };

  try {
    const res = await s3
      .copyObject({
        Bucket: target.bucket,
        Key: target.key,
        CopySource: encodeURI(`${source.bucket}/${source.key}`),
        ACL: args.acl,
        ContentType: args.contentType,
        ContentDisposition: args.contentDisposition,
      })
      .promise();
    const etag = res.CopyObjectResult?.ETag;
    return done(200, { etag });
  } catch (err) {
    const status = err.statusCode || 500;
    const error = new Error(err.code);
    return done(status, { error });
  }
}
