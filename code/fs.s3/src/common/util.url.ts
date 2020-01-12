import { parse as parseUrl } from 'url';

import { AWS, toMimetype, value, id } from './libs';
import * as t from './types';
import { formatBucket, formatKeyPath } from './util.format';

/**
 * Derive the endpoint to a bucket.
 */
export function toBucketUrl(args: { s3: AWS.S3; bucket: string }) {
  const bucket = formatBucket(args.bucket);
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
  const path = formatKeyPath(args.path);
  return `${endpoint}/${path}`;
}

/**
 * Generate a pre-signed URL (GET|PUT).
 */
export function toPresignedUrl(args: {
  s3: AWS.S3;
  bucket: string;
  path: string | undefined;
  options: t.S3SignedUrlArgs;
}) {
  const { s3, bucket } = args;
  const path = formatKeyPath(args.path);
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
    const options = args.options as t.S3SignedUrlPutObjectArgs;
    params.Body = options.body;
    params.ContentMD5 = options.md5;
  }

  return s3.getSignedUrl(operation, params);
}

/**
 * Generate a pre-signed URL (POST).
 */
export function toPresignedPost(args: t.S3SignedPostArgs & { s3: AWS.S3 }) {
  const { s3, seconds, acl, bucket } = args;

  const key = formatKeyPath(args.key);
  if (!key) {
    throw new Error(`Object key path must be specified for pre-signed URLs.`);
  }

  const contentType = args.contentType || toMimetype(key, 'application/octet-stream');
  const fields = {
    'content-type': contentType,
    'content-disposition': args.contentDisposition,
    uid: id.cuid(), // NB: Prevents idempotent result props (Policy/Signature). Makes it harder to spoof with repeat calls.
    acl,
    key,
  };

  const Conditions: any[] = [];
  if (args.size) {
    const { min, max } = args.size;
    Conditions.push(['content-length-range', min, max]);
  }

  // Generate the presigned URL.
  const post = s3.createPresignedPost({
    Expires: seconds,
    Bucket: bucket,
    Conditions,
    Fields: value.deleteUndefined(fields),
  });

  // Finish up.
  const res: t.S3SignedPostUrl = {
    url: post.url,
    props: post.fields,
  };
  return res;
}
