import { Vercel, t } from 'vendor.vercel/lib/node';

const token = process.env.VERCEL_TEST_TOKEN;

/**
 * https://vercel.com/docs/cli#project-configuration/routes
 * Route regex:
 *    https://www.npmjs.com/package/path-to-regexp
 */
async function deploy(project: string, alias: string) {
  const deployment = Vercel.Deploy({ token, dir: 'dist/web', team: 'tdb', project });

  const manifest = await deployment.manifest<t.ModuleManifest>();
  const module = manifest?.module;
  const name = module ? `${module.namespace}-v${module.version}` : 'unnamed';

  console.log('deploying:');
  console.log(' •', name);
  console.log(' •', manifest.hash.module);
  console.log(' •', `${manifest.files.length} files`);

  const wait = deployment.commit({
    // target: 'production',
    regions: ['sfo1'],
    alias,
    name,
    // routes: [{ src: '/workshop-1', dest: '/' }],
  });

  const res = await wait;
  console.log(res.deployment);
  console.log('-------------------------------------------');
  console.log(res.status);
  console.log('deployment:', name);
  console.log();

  return { status: res.status, name };
}

// DEV
deploy('db-dev', 'dev.db.team');
