import { fs } from './libs';

export const IS_CLOUD = Boolean(process.env.VERCEL_URL);

const TMP = IS_CLOUD ? '/tmp' : fs.resolve('tmp');
const CACHE_DIR = fs.join(TMP, 'runtime.node');
const MANIFEST_FILENAME = 'index.json';

export const PATH = {
  TMP,
  CACHE_DIR,
  MANIFEST_FILENAME,
};
