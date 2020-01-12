import { AWS, formatTimestamp, formatETag, t, defaultValue } from '../common';

/**
 * Read a file from S3.
 */
export async function get(args: {
  s3: AWS.S3;
  bucket: string;
  key: string;
}): Promise<t.S3GetResponse> {
  const { s3, bucket, key } = args;
  let json: t.Json | undefined;

  const response: t.S3GetResponse = {
    ok: true,
    status: 200,
    key,
    modifiedAt: -1,
    etag: '',
    contentType: '',
    bytes: -1,
    data: undefined,
    get json(): t.Json {
      if (!json) {
        try {
          const text = response.data ? response.data.toString('utf-8') : undefined;
          json = text ? JSON.parse(text) : null;
        } catch (error) {
          throw new Error(`Failed to parse S3 object at key [${key}] from JSON. ${error.message}`);
        }
      }
      return json || null;
    },
  };

  try {
    const obj = await s3.getObject({ Bucket: bucket, Key: key }).promise();
    response.modifiedAt = formatTimestamp((obj as any).LastModified);
    response.etag = formatETag(obj.ETag);
    response.data = obj.Body instanceof Buffer ? obj.Body : undefined;
    response.contentType = obj.ContentType || '';
    response.bytes = defaultValue(obj.ContentLength, -1);
  } catch (err) {
    const error = new Error(err.code);
    response.status = err.statusCode;
    response.ok = false;
    response.error = error;
  }

  return response;
}
