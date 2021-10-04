import { Vercel, t } from 'vendor.cloud.vercel/lib/node';
import { fs } from '@platform/fs';

const token = process.env.VERCEL_TEST_TOKEN;

/**
 * https://vercel.com/docs/cli#project-configuration/routes
 *
 * Route regex:
 *    https://www.npmjs.com/package/path-to-regexp
 *
 */
async function deploy(team: string, project: string, dir: string, alias?: string) {
  const beforeUpload: t.VercelHttpBeforeFileUpload = async (e) => {
    if (e.path.endsWith('main.js')) {
      e.modify('console.log("hello");');
    }
  };

  const size = await fs.size.dir(fs.resolve(dir));
  const deployment = Vercel.Deploy({ token, dir, team, project, beforeUpload });
  const manifest = await deployment.manifest<t.ModuleManifest>();

  console.log('\ndeploying:');
  console.log(' • manifest:', manifest?.hash?.module);
  console.log(' • size:    ', `${size.files.length} files, ${size.toString()}`);
  console.log();

  const wait = deployment.commit({
    target: alias ? 'production' : 'staging',
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
// deploy('tdb', 'db-dev', 'dist/node', 'dev.db.team');
deploy('tdb', 'db-dev', 'dist/node');
