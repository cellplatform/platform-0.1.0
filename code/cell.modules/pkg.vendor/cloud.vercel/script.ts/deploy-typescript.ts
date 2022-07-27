import { Vercel } from 'vendor.cloud.vercel/lib/node';

const token = process.env.VERCEL_TEST_TOKEN || '';

/**
 * https://vercel.com/docs/cli#project-configuration/routes
 *
 * Route regex:
 *    https://www.npmjs.com/package/path-to-regexp
 *
 */
async function deploy(team: string, project: string, dir: string, alias?: string) {
  const deployment = Vercel.Deploy({ token, dir, team, project });
  const info = await deployment.info();

  await Vercel.Log.beforeDeploy({ info, alias });

  const res = await deployment.commit({
    // target: alias ? 'production' : 'staging',
    regions: ['sfo1'],
    alias,
  });

  // Finish up.
  await Vercel.Log.afterDeploy(res);
}

// tmp.node
deploy('tdb', 'tmp', 'dist/typescript');
