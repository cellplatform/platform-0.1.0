import { fs } from '..';

function loadEnv(provider: string) {
  const env = (suffix: string) => fs.env.value(`${provider}_${suffix}`);
  const endpoint = env('ENDPOINT');
  const accessKey = env('KEY');
  const secret = env('SECRET');
  const bucket = env('BUCKET');
  return { provider, endpoint, bucket, accessKey, secret };
}

export function init(PROVIDER: string) {
  const { endpoint, accessKey, secret, bucket } = loadEnv(PROVIDER);
  const PATH = 'tmp/test';
  return {
    PROVIDER,
    ENDPOINT: endpoint,
    BUCKET: bucket,
    PATH,
    BASE_URL: `https://${bucket}.${endpoint}/${PATH}`,
    s3: fs.s3({ endpoint, accessKey, secret }),
  };
}

export const util = {
  init,
};
