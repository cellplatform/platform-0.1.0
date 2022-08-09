import { fs } from '@platform/fs';
import { Vercel } from 'vendor.cloud.vercel/lib/node';

const token = process.env.VERCEL_TEST_TOKEN || '';

export async function deploy(dir: string, team: string, project: string, alias: string) {
  // const dir = 'dist';
  // await fs.copy('vercel.json', fs.join(dir, 'vercel.json'));
  // await Vercel.ConfigFile.prepare({ dir });

  const name = fs.basename(fs.dirname(dir));

  const deployment = Vercel.Deploy({ token, dir, team, project, name });
  const info = await deployment.info();

  await Vercel.Log.beforeDeploy({ info, alias, project });

  const res = await deployment.commit(
    { target: 'production', regions: ['sfo1'], alias },
    { ensureProject: true },
  );

  // Finish up.
  await Vercel.Log.afterDeploy(res);
}
