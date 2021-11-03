import { fs } from '@platform/fs';
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
  // const { client } = Vercel.Node({ token });
  // const team = await client.teams.byName(teamName);
  // const res = await team.project(projectName).create();

  const deployment = Vercel.Deploy({ token, dir, team, project });
  const manifest = await deployment.manifest<t.ModuleManifest>();

  console.log('deploying:');
  console.log(' • manifest', manifest?.hash.files);

  const wait = deployment.commit({
    target: 'production',
    regions: ['sfo1'],
    alias,
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
const dir = fs.resolve('../../pkg.sys/net/dist/web');
deploy('tdb', 'family-tmp', dir, 'tmp.sys.family');
// deploy('tdb', 'tmp', 'dist/web');

console.log('dir', dir);
