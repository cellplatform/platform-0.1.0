import { Vercel } from 'vendor.cloud.vercel/lib/node';
import { t } from '../src/common';

const token = process.env.VERCEL_TEST_TOKEN;

/**
 * https://vercel.com/docs/cli#project-configuration/routes
 *
 * Route regex:
 *    https://www.npmjs.com/package/path-to-regexp
 *
 */
export async function deploy(team: string, project: string, alias: string) {
  const deployment = Vercel.Deploy({ token, dir: 'dist/web', team, project });

  const info = await deployment.info();
  console.log();
  console.log('deploying:');
  console.log(' • size:  ', info.files.toString());
  console.log(' • alias: ', alias);
  console.log();

  const res = await deployment.commit(
    {
      target: 'production',
      regions: ['sfo1'],
      alias,
    },
    { ensureProject: true },
  );
  const status = res.status;
  const name = res.deployment.name;

  console.log(res.deployment);
  console.log('-------------------------------------------');
  console.log(status);
  console.log(name);
  if (res.error) console.log('error', res.error);
  console.log();

  return { status, name };
}
