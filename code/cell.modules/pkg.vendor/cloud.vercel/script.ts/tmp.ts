import { t, Vercel } from 'vendor.cloud.vercel/lib/node';

const token = process.env.VERCEL_TEST_TOKEN || '';

/**
 * https://vercel.com/docs/cli#project-configuration/routes
 *
 * Route regex:
 *    https://www.npmjs.com/package/path-to-regexp
 *
 */
async function deploy(team: string, project: string, dir: string, alias?: string) {
  const beforeUpload: t.VercelHttpBeforeFileUpload = async (e) => {
    console.log('-------------------------------------------');
    console.log('path:        ', e.path);
    console.log('contentType: ', e.contentType);
    console.log();
  };

  const deployment = Vercel.Deploy({ token, dir, team, project, beforeUpload });
  const info = await deployment.info();

  Vercel.Log.beforeDeploy({ info, alias });

  const res = await deployment.commit(
    {
      target: alias ? 'production' : 'staging',
      regions: ['sfo1'],
      alias,
    },
    { ensureProject: true },
  );

  // Finish up.
  Vercel.Log.afterDeploy(res);
}

// DEV
// deploy('tdb', 'tdb-tmp-deploy', 'dist/node');
deploy('tdb', 'tdb-tmp', 'tmp/foo', 'tmp.db.team');
