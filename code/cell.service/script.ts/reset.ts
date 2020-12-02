import { fs } from '@platform/fs';

(async () => {
  const remove = (path: string) => fs.remove(fs.resolve(path));

  await remove('tmp');
  await remove('deployment/tmp');
})();
