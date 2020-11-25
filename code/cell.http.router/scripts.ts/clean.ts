import { fs } from '@platform/fs';

(async () => {
  await fs.remove(fs.resolve('tmp'));
})();
