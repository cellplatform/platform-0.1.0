import { t, util } from '../common';

export function url(args: {
  getS3: t.GetAwsS3;
  endpoint: t.S3Endpoint;
  bucket: string;
  path?: string;
}) {
  const { getS3, bucket, path } = args;
  const object = util.toObjectUrl({ s3: getS3('edge'), bucket, path });
  return {
    object,

    signedGet(options: t.S3SignedUrlGetObjectOptions = {}) {
      const s3 = getS3('edge');
      return util.toPresignedUrl({
        s3,
        bucket,
        path,
        options: { ...options, operation: 'getObject' },
      });
    },

    signedPut(options: t.S3SignedUrlPutObjectOptions = {}) {
      const s3 = getS3('origin');
      return util.toPresignedUrl({
        s3,
        bucket,
        path,
        options: { ...options, operation: 'putObject' },
      });
    },

    signedPost(options: t.S3SignedPostArgs) {
      const s3 = getS3('origin');
      return util.toPresignedPost({
        s3,
        ...options,
        bucket,
        key: path || (options || {}).key,
      });
    },
  };
}
