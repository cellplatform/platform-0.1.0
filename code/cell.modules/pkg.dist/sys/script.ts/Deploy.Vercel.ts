import { Vercel, t } from 'vendor.cloud.vercel/lib/node';

const token = process.env.VERCEL_TEST_TOKEN || '';

export async function deploy(args: {
  dir: string;
  team: string;
  project: string;
  alias: string;
  name?: string; // Deployment name.
}) {
  const { dir, team, project, alias, name } = args;

  const deployment = Vercel.Deploy({ token, dir, team, project, name });
  const info = (await deployment.info()) as t.VercelSourceBundleInfo;
  await Vercel.Log.beforeDeploy({ info, alias, project });

  const res = await deployment.commit(
    { target: 'production', regions: ['sfo1'], alias },
    { ensureProject: true },
  );

  // Finish up.
  await Vercel.Log.afterDeploy(res);
}
