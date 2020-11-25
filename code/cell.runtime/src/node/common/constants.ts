import { fs } from './libs';
import { BUNDLE } from '@platform/cell.schema/lib/common/constants';

export const IS_CLOUD = Boolean(process.env.VERCEL_URL);

const TMP = IS_CLOUD ? '/tmp' : fs.resolve('tmp');
const CACHE_DIR = fs.join(TMP, 'runtime.node');

export const PATH = {
  TMP,
  CACHE_DIR,
  MANIFEST: BUNDLE.MANIFEST.FILENAME,
};
