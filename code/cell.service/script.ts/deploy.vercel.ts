/* eslint-disable no-console */

import { Vercel } from 'vendor.vercel/lib/node';

const token = process.env.VERCEL_TEST_TOKEN;

/**
 * https://vercel.com/docs/cli#project-configuration/routes
 * Route regex:
 *    https://www.npmjs.com/package/path-to-regexp
 */
async function deploy(project: string, alias: string) {
  const pkg = require('../package.json') as { name: string; version: string }; // eslint-disable-line
  const version = pkg.version ?? '0.0.0';
  const name = `${alias}@${version}`;

  const deployment = Vercel.Deploy({ token, dir: 'dist/web', team: 'tdb', project });
  const wait = deployment.push({
    // target: 'production',
    regions: ['sfo1'],
    alias,
    name,
    // routes: [{ src: '/foo', dest: '/' }],
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
// deploy('db-dev', 'dev.db.team');

console.log('deploy stub (vercel) 🌳🐷🐙🦞');
