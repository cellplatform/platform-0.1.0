import { t, util } from '../common';

export function url(args: {
  getS3: t.GetAwsS3;
  bucket: string;
  path?: string;
  endpoint?: t.S3EndpointKind;
}) {
  const { getS3, bucket, path, endpoint } = args;
  const object = util.toObjectUrl({ s3: getS3(endpoint || 'edge'), bucket, path });
  return {
    object,

    signedGet(options: t.S3SignedUrlGetObjectOptions = {}) {
      const s3 = getS3(endpoint || 'edge');
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
