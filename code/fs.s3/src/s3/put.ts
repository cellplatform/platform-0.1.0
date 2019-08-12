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
    const ContentType = toContentType(key);
    const res = await s3
      .upload({ Bucket: bucket, Key: key, Body, ACL: args.acl, ContentType })
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

/**
 * [Helpers]
 */

/**
 * - https://en.wikipedia.org/wiki/Media_type
 */
export function toContentType(key: string) {
  if (key.endsWith('.js')) {
    return 'application/javascript';
  }

  if (key.endsWith('.json')) {
    return 'application/json';
  }

  if (key.endsWith('.yaml') || key.endsWith('.yml')) {
    return 'text/plain';
  }

  if (key.endsWith('.txt')) {
    return 'text/plain';
  }

  if (key.endsWith('.html') || key.endsWith('.htm')) {
    return 'text/html';
  }

  if (key.endsWith('.css')) {
    return 'text/css';
  }

  if (key.endsWith('.png')) {
    return 'image/png';
  }

  if (key.endsWith('.jpg') || key.endsWith('.jpeg')) {
    return 'image/jpeg';
  }

  if (key.endsWith('.gif')) {
    return 'image/gif';
  }

  if (key.endsWith('.zip')) {
    return 'application/zip';
  }

  if (key.endsWith('.pdf')) {
    return 'application/pdf';
  }

  if (key.endsWith('.csv') || key.endsWith('.tsv')) {
    return 'text/csv';
  }

  return undefined;
}
