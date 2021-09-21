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
  const deployment = Vercel.Deploy({ token, dir: 'dist/web', team, project });
  const manifest = await deployment.manifest<t.ModuleManifest>();

  console.log('\ndeploying:');
  console.log(' •', manifest.hash.module);
  console.log(' •', `${manifest.files.length} files\n`);

  const wait = deployment.push({
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
  console.log();

  return { status, name };
}

// DEV
// deploy('tdb', 'db-dev', 'dev.db.team');
deploy('tdb', 'os-domains', 'os.domains');
