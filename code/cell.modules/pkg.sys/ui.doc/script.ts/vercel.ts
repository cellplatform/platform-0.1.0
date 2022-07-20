import { fs } from '@platform/fs';
import { Vercel } from 'vendor.cloud.vercel/lib/node';

const token = process.env.VERCEL_TEST_TOKEN || '';

export async function deploy(team: string, project: string, alias: string) {
  const dir = 'dist/web';
  await fs.copy('vercel.json', fs.join(dir, 'vercel.json'));
  await Vercel.ConfigFile.prepare({ dir });

  const deployment = Vercel.Deploy({ token, dir, team, project });
  const info = await deployment.info();

  Vercel.Log.beforeDeploy({ info, alias, project });

  const res = await deployment.commit(
    { target: 'production', regions: ['sfo1'], alias },
    { ensureProject: true },
  );

  // Finish up.
  Vercel.Log.afterDeploy(res);
}
