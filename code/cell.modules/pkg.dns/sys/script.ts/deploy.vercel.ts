import { Vercel } from 'vendor.cloud.vercel/lib/node';

const token = process.env.VERCEL_TEST_TOKEN;

/**
 * https://vercel.com/docs/cli#project-configuration/routes
 *
 * Route regex:
 *    https://www.npmjs.com/package/path-to-regexp
 *
 */
async function deploy(team: string, project: string, alias: string) {
  const deployment = Vercel.Deploy({ token, dir: 'dist/web', team, project });
  const manifest = await deployment.manifest<t.ModuleManifest>();

  console.log('\ndeploying:');
  console.log(' • module:', manifest.hash.module);
  console.log(' • files: ', `${manifest.files.length} files`);
  console.log(' • alias: ', alias);
  console.log();

  const wait = deployment.commit({
    target: 'production',
    regions: ['sfo1'],
    alias,
    // routes: [{ src: '/foo', dest: '/' }],
  });
  const res = await wait;
  const status = res.status;
  const name = res.deployment.name;

  console.log(res.deployment);
  console.log('-------------------------------------------');
  console.log(status);
  console.log(name);
  console.log('error', res.error);
  console.log();

  return { status, name };
}

// DEV
deploy('tdb', 'tdb-sys', 'sys.db.team');
