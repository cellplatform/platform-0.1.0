import { AWS, t, util } from '../common';

export function url(s3: AWS.S3, bucket: string, path?: string) {
  const object = util.toObjectUrl({ s3, bucket, path });
  return {
    object,
    signedGet(options: t.S3SignedUrlGetObjectOptions = {}) {
      return util.toPresignedUrl({
        s3,
        bucket,
        path,
        options: { ...options, operation: 'getObject' },
      });
    },
    signedPut(options: t.S3SignedUrlPutObjectOptions = {}) {
      return util.toPresignedUrl({
        s3,
        bucket,
        path,
        options: { ...options, operation: 'putObject' },
      });
    },
    signedPost(options: t.S3SignedPostArgs) {
      return util.toPresignedPost({
        s3,
        ...options,
        bucket,
        key: path || (options || {}).key,
      });
    },
  };
}
