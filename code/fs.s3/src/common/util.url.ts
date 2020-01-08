import { AWS, t, util } from '../common';
import { parse as parseUrl } from 'url';

/**
 * Derive the endpoint to a bucket.
 */
export function toBucketUrl(args: { s3: AWS.S3; bucket: string }) {
  const bucket = util.formatBucket(args.bucket);
  if (!bucket) {
    throw new Error(`No bucket provided.`);
  }
  const url = parseUrl(args.s3.endpoint.href, false);
  return `https://${bucket}.${url.host}`;
}

/**
 * Generate a simple URL to the object.
 */
export function toObjectUrl(args: { s3: AWS.S3; bucket: string; path?: string }) {
  const { s3, bucket } = args;
  const endpoint = toBucketUrl({ s3, bucket });
  const path = util.formatKeyPath(args.path);
  return `${endpoint}/${path}`;
}

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
