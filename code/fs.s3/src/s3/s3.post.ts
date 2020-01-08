import { AWS, FormData, http, t, util, value } from '../common';

/**
 * AWS conditions
 * - https://docs.aws.amazon.com/AmazonS3/latest/dev/amazon-s3-policy-keys.html
 */

/**
 * Generate a pre-signed POST-able multi-part form.
 * NOTE:
 *    This is useful for
 */
export function post(args: t.S3SignedPostArgs & { s3: AWS.S3 }): t.S3SignedPost {
  const { s3, bucket } = args;
  const key = util.formatKeyPath(args.key);
  const presignedPost = util.toPresignedPost(args);
  const props = presignedPost.props;

  // Prepare the POST return API object.
  const url = util.toObjectUrl({ s3, bucket, path: key });
  const res: t.S3SignedPost = {
    url: { form: presignedPost.url, object: url },
    props,

    /**
     * Prepare and POST the multi-part form to S3.
     */
    send(data: Buffer, options: { headers?: t.IHttpHeaders } = {}): Promise<t.S3PostResponse> {
      return new Promise<t.S3PostResponse>(async (resolve, reject) => {
        // Build the form.
        const contentType = presignedPost.props['content-type'];
        const form = new FormData();
        Object.keys(props)
          .map(key => ({ key, value: props[key] }))
          .forEach(({ key, value }) => form.append(key, value));
        form.append('file', data, { contentType }); // NB: file-data must be added last for S3.

        // Send to S3.
        const headers = { ...options.headers, ...form.getHeaders() };
        const res = await http.post(presignedPost.url, form, { headers });
        const { status } = res;

        const done = (
          status: number,
          options: { etag?: string; error?: Error; bytes?: number } = {},
        ) => {
          const ok = util.isOK(status);
          const etag = util.formatETag(options.etag);
          const error = options.error;
          const bytes = value.defaultValue(options.bytes, -1);
          const res: t.S3PostResponse = {
            ok,
            status,
            key,
            bucket,
            url,
            contentType,
            etag,
            bytes,
            error,
          };
          resolve(res);
        };

        // Finish up.
        if (res.ok) {
          s3.headObject({ Bucket: bucket, Key: key }, (err, meta) => {
            if (err) {
              // Fail.
              const error = new Error(`Failed getting object meta-data. ${err.message}`.trim());
              done(500, { error });
            } else {
              // Success.
              const etag = meta.ETag;
              const bytes = meta.ContentLength;
              done(status, { etag, bytes });
            }
          });
        } else {
          const error = new Error(`Failed to post object. ${res.statusText}`.trim());
          done(status, { error });
        }
      });
    },
  };

  // Finish up.
  return res;
}
