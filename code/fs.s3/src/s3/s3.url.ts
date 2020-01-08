import { AWS, t, util } from '../common';

/**
 * Generate a pre-signed URL.
 */
export function toPresignedUrl(args: {
  s3: AWS.S3;
  bucket: string;
  path: string | undefined;
  options: t.S3PresignedUrlArgs;
}) {
  const { s3, bucket } = args;
  const path = util.formatKeyPath(args.path);
  if (!path) {
    throw new Error(`Object key path must be specified for pre-signed URLs.`);
  }

  const { operation, seconds } = args.options;

  const params: any = {
    Bucket: bucket,
    Key: path,
    Expires: seconds,
  };

  if (operation === 'putObject') {
    const options = args.options as t.S3PresignedUrlPutObjectArgs;
    params.Body = options.body;
    params.ContentMD5 = options.md5;
  }

  return s3.getSignedUrl(operation, params);
}
