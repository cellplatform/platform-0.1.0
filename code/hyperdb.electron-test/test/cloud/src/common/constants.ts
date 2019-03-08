import { is, fs } from './libs';

export const TMP = is.prod ? '/tmp' : fs.resolve('./tmp');
