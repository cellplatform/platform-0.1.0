import { Vercel } from 'vendor.vercel/lib/node';

const token = process.env.VERCEL_TEST_TOKEN;

async function deploy(team: string, project: string, alias: string) {
  // Vercel.
  const pkg = require('../package.json') as { name: string; version: string };
  // const name =

  // sys.net
  // https://db-dev-o0lno2amo-tdb.vercel.app

  const deployment = Vercel.Deploy({ token, dir: 'dist/router', team, project });
  const manifest = await deployment.manifest<t.ModuleManifest>();

  console.log('deploying...');
  // console.log(' •', manifest.hash.module);
  // console.log(' •', `${manifest.files.length} files`);

  // const t = deployment.client.team(team);
  // await t.project(project).create();

  const wait = deployment.push({
    target: 'production',
    regions: ['sfo1'],
    alias,
    name: `os.domains-${pkg.version}`,
    routes: [
      { src: '/sys.net', dest: 'https://os-domains-2dejqzxbd-tdb.vercel.app/' },
      { src: '/foo2', dest: 'https://db-dev-o0lno2amo-tdb.vercel.app' },
      { src: '/foo', dest: '/foo.json' },
    ],
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

deploy('tdb', 'os-domains', 'os.domains');
