import { AWS, t } from '../common';

/**
 * Delete a single file from S3.
 */
export async function deleteOne(args: {
  s3: AWS.S3;
  bucket: string;
  key: string;
}): Promise<t.S3DeleteOneResponse> {
  const { s3, bucket, key } = args;
  try {
    await s3.deleteObject({ Bucket: bucket, Key: key }).promise();
    return { ok: true, status: 200, key, bucket };
  } catch (err) {
    const status = err.statusCode;
    const error = new Error(err.code);
    return { ok: false, status, key, bucket, error };
  }
}

/**
 * Delete a multiple files from S3.
 */
export async function deleteMany(args: {
  s3: AWS.S3;
  bucket: string;
  keys: string[];
}): Promise<t.S3DeleteManyResponse> {
  const { s3, bucket, keys = [] } = args;
  try {
    const Objects = keys.map(Key => ({ Key }));
    const Delete = { Objects };
    await s3.deleteObjects({ Bucket: bucket, Delete }).promise();
    return { ok: true, status: 200, keys, bucket };
  } catch (err) {
    const status = err.statusCode;
    const error = new Error(err.code);
    return { ok: false, status, keys, bucket, error };
  }
}
