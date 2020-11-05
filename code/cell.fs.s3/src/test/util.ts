import { s3 } from '..';
import { fs } from '../common';

export const writeFile = async (path: string, data: Buffer) => {
  await fs.ensureDir(fs.dirname(path));
  await fs.writeFile(path, data);
};

function loadEnv(provider: string) {
  const env = (suffix: string) => fs.env.value(`${provider}_${suffix}`);
  const endpoint = env('ENDPOINT');
  const accessKey = env('KEY');
  const secret = env('SECRET');
  const bucket = env('BUCKET');
  return { provider, endpoint, bucket, accessKey, secret };
}

function factory(prefix: string, defaultPath: string) {
  return (args: { path?: string } = {}) => {
    const { endpoint, accessKey, secret } = loadEnv(prefix);
    return s3.init({
      root: args.path || defaultPath,
      endpoint,
      accessKey,
      secret,
    });
  };
}

export const PATH = {
  TMP: fs.resolve('tmp'),
  LOCAL: fs.resolve('tmp/local'),
  KEY: 'tmp/test',
};

// const ENV = loadEnv('WASABI');
const ENV = loadEnv('SPACES');

export const util = {
  PATH,
  ENV,
  fs,
  s3: factory(ENV.provider, `${ENV.bucket}/${PATH.KEY}`),
  writeFile,
  async image(path: string) {
    return fs.readFile(fs.join(fs.resolve(`src/test/images`), path));
  },
  async reset() {
    await fs.remove(PATH.TMP);
  },
};
