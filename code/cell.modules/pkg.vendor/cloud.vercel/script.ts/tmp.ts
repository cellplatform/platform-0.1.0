import { fs } from '@platform/fs';
import { Vercel, t } from 'vendor.cloud.vercel/lib/node';

(async () => {
  const json = await fs.readJson('tmp/res.json');

  await Vercel.Log.afterDeploy(json);
})();
