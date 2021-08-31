import { AWS, formatTimestamp, formatETag, t, defaultValue } from '../common';

/**
 * https://docs.aws.amazon.com/AmazonS3/latest/dev/acl-overview.html
 */
const AWS_ACL = {
  ALL_USERS: 'http://acs.amazonaws.com/groups/global/AllUsers',
};

/**
 * Read a file from S3.
 */
export async function get(args: {
  s3: AWS.S3;
  bucket: string;
  key: string;
  metaOnly?: boolean;
}): Promise<t.S3GetResponse> {
  const { s3, bucket, key } = args;
  const id = { Bucket: bucket, Key: key };
  let json: t.Json | undefined;

  const response: t.S3GetResponse = {
    ok: true,
    status: 200,
    key,
    modifiedAt: -1,
    etag: '',
    permission: 'private',
    contentType: '',
    bytes: -1,
    data: undefined,
    get json(): t.Json {
      if (!json) {
        try {
          const text = response.data ? response.data.toString() : undefined;
          json = text ? JSON.parse(text) : null;
        } catch (error: any) {
          throw new Error(`Failed to parse S3 object at key [${key}] from JSON. ${error.message}`);
        }
      }
      return json || null;
    },
  };

  const readProps = (obj: AWS.S3.GetObjectOutput | AWS.S3.HeadObjectOutput) => {
    response.modifiedAt = formatTimestamp((obj as any).LastModified);
    response.etag = formatETag(obj.ETag);
    response.contentType = obj.ContentType || '';
    response.bytes = defaultValue(obj.ContentLength, -1);
    return obj;
  };

  const readObject = async () => {
    if (args.metaOnly) {
      // Metadata only.
      readProps(await s3.headObject(id).promise());
    } else {
      // Metadata AND file-data.
      const obj = await s3.getObject(id).promise();
      readProps(obj);
      response.data = obj.Body instanceof Buffer ? obj.Body : undefined;
    }
  };

  const readPermission = async () => {
    const info = await s3.getObjectAcl(id).promise();
    const grants = info.Grants || [];
    response.permission = grants
      .map((grant) => ({ uri: grant.Grantee?.URI || '', permission: grant.Permission || '' }))
      .some((grant) => grant.uri === AWS_ACL.ALL_USERS && grant.permission === 'READ')
      ? 'public-read'
      : 'private';
  };

  try {
    await Promise.all([readObject(), readPermission()]);
  } catch (err: any) {
    const error = new Error(err.code);
    response.status = err.statusCode;
    response.ok = false;
    response.error = error;
  }

  return response;
}
