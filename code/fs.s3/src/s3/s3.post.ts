import { AWS, FormData, http, t, util, value } from '../common';

/**
 * AWS conditions
 * - https://docs.aws.amazon.com/AmazonS3/latest/dev/amazon-s3-policy-keys.html
 */

/**
 * Generates a pre-signed POST-able multi-part form.
 */
export function post(args: {
  s3: AWS.S3;
  bucket: string;
  key: string;
  acl?: t.S3Permissions;
  contentType?: string;
  contentDisposition?: string;
  size?: t.S3ByteSizeRange;
  seconds?: number;
}): t.S3Post {
  const { s3, bucket, seconds, acl } = args;
  const key = util.formatKeyPath(args.key);
  const contentType = args.contentType || util.toContentType(key, 'application/octet-stream');

  const fields = {
    'content-type': contentType,
    'content-disposition': args.contentDisposition,
    acl,
    key,
  };

  const Conditions: any[] = [];
  if (args.size) {
    const { min, max } = args.size;
    Conditions.push(['content-length-range', min, max]);
  }

  // Generate the presigned URL.
  const presignedPost = s3.createPresignedPost({
    Expires: seconds,
    Bucket: bucket,
    Conditions,
    Fields: value.deleteUndefined(fields),
  });

  // Prepare the POST return API object.
  const url = util.toObjectUrl({ s3, bucket, path: key });
  const res: t.S3Post = {
    /**
     * Properties.
     */
    url,
    fields: presignedPost.fields,

    /**
     * Prepare and POST the multi-part form to S3.
     */
    send(data: Buffer, options: { headers?: t.IHttpHeaders } = {}): Promise<t.S3PostResponse> {
      return new Promise<t.S3PostResponse>(async (resolve, reject) => {
        // Build the form.
        const form = new FormData();
        Object.keys(presignedPost.fields)
          .map(key => ({ key, value: presignedPost.fields[key] }))
          .forEach(({ key, value }) => form.append(key, value));
        form.append('file', data, { contentType }); // NB: file-data must be added last for S3.

        // Send to S3.
        const headers = { ...options.headers, ...form.getHeaders() };
        const res = await http.post(presignedPost.url, form, { headers });
        const { status } = res;

        // Finish up.
        if (res.ok) {
          s3.headObject({ Bucket: bucket, Key: key }, (err, meta) => {
            if (err) {
              const error = new Error(`Failed getting object meta-data. ${err.message}`.trim());
              resolve({ ok: false, status: 500, key, bucket, url, contentType, etag: '', error });
            } else {
              const etag = util.formatETag(meta.ETag);
              resolve({ ok: true, status, key, bucket, url, contentType, etag });
            }
          });
        } else {
          const error = new Error(`Failed to post object. ${res.statusText}`.trim());
          resolve({ ok: false, status, key, bucket, url, contentType, etag: '', error });
        }
      });
    },
  };

  // Finish up.
  return res;
}
