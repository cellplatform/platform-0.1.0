import { Vercel } from 'vendor.vercel/lib/node';

const token = process.env.VERCEL_TEST_TOKEN;

/**
 * https://vercel.com/docs/cli#project-configuration/routes
 *
 * Route regex:
 *    https://www.npmjs.com/package/path-to-regexp
 *
 */
async function deploy(team: string, project: string, alias: string) {
  const deployment = Vercel.Deploy({ token, dir: 'dist/node', team, project });
  const manifest = await deployment.manifest<t.ModuleManifest>();

  console.log('deploying:');
  console.log(' •', manifest.hash.module);
  console.log(' •', `${manifest.files.length} files`);

  const wait = deployment.push({
    // target: 'production',
    regions: ['sfo1'],
    alias,
    // routes: [{ src: '/foo', dest: '/' }],
  });

  const res = await wait;
  console.log(res.deployment);
  console.log('-------------------------------------------');
  console.log(res.status);
  console.log('deployment:', res.deployment.name);
  console.log();

  return { status: res.status };
}

// DEV
deploy('tdb', 'db-dev', 'tmp.dev.db.team');
