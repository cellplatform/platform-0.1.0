import { fs } from './common';

(async () => {
  const dir = fs.resolve('./src.sample/tmp');
  await fs.remove(dir);
})();
