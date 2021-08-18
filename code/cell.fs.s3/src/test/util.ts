import { FsS3 } from '..';
import { fs } from '../common';

export const writeFile = async (path: string, data: Buffer) => {
  await fs.ensureDir(fs.dirname(path));
  await fs.writeFile(path, data);
};

function loadEnv(provider: string) {
  const env = (suffix: string) => fs.env.value(`${provider}_${suffix}`);
  const endpoint = { origin: env('ORIGIN'), edge: env('EDGE') };
  const accessKey = env('KEY');
  const secret = env('SECRET');
  const bucket = env('BUCKET');
  return { provider, endpoint, bucket, accessKey, secret };
}

export function init(PROVIDER: string, root?: string) {
  const { endpoint, accessKey, secret, bucket } = loadEnv(PROVIDER);
  const PATH = 'tmp/test';
  const ROOT = root || `${bucket}/${PATH}`;
  return {
    PROVIDER,
    ENDPOINT: endpoint,
    BUCKET: bucket,
    ROOT,
    PATH,
    fs: FsS3({ dir: ROOT, endpoint, accessKey, secret }),
  };
}

export const PATH = {
  TMP: fs.resolve('tmp'),
  LOCAL: fs.resolve('tmp/local'),
};

export const util = {
  PATH,
  fs,
  init,
  writeFile,
  async image(path: string) {
    return fs.readFile(fs.join(fs.resolve(`src/test/images`), path));
  },
  async reset() {
    await fs.remove(PATH.TMP);
  },
};
