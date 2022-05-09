import { Vercel } from 'vendor.cloud.vercel/lib/node';

const token = process.env.VERCEL_TEST_TOKEN;

/**
 * https://vercel.com/docs/cli#project-configuration/routes
 *
 * Route regex:
 *    https://www.npmjs.com/package/path-to-regexp
 *
 */
async function deploy(team: string, project: string, dir: string, alias?: string) {
  const deployment = Vercel.Deploy({ token, dir, team, project });
  await Vercel.Log.beforeDeploy(deployment, { alias });

  const res = await deployment.commit(
    {
      target: alias ? 'production' : 'staging',
      regions: ['sfo1'],
      alias,
      // routes: [{ src: '/foo', dest: '/' }],
    },
    { ensureProject: true },
  );

  // Finish up.
  Vercel.Log.afterDeploy(res);
}

// DEV
// deploy('tdb', 'db-dev', 'dist/node', 'dev.db.team');
deploy('tdb', 'tdb-tmp', 'dist/web', 'tmp.db.team');
