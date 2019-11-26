import { fs } from './common';

(async () => {
  const dir = fs.resolve('./src.tmpl/tmp');
  await fs.remove(dir);
})();
