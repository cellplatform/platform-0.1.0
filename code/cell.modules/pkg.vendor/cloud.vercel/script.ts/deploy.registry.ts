import { Vercel, t } from 'vendor.vercel/lib/node';
import { fs } from '@platform/fs';

type Rewrite = { source: string; destination: string };

const token = process.env.VERCEL_TEST_TOKEN;

/**
 * https://vercel.com/docs/cli#project-configuration/routes
 *
 * Route regex:
 *    https://www.npmjs.com/package/path-to-regexp
 *
 */
async function deploy(team: string, project: string, dir: string, alias?: string) {
  const size = await fs.size.dir(fs.resolve(dir));
  const deployment = Vercel.Deploy({ token, dir, team, project });

  console.log('\ndeploying:');
  console.log(' •', dir);
  console.log(' •', `${size.files.length} files, ${size.toString()}`);
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
  const meta = res.deployment.meta as t.VercelHttpDeployMetaModule;

  console.log(res.deployment);
  console.log('-------------------------------------------');
  console.log(status);
  console.log(name);
  console.log();

  return {
    status,
    name,
    namespace: meta.namespace,
    url: { public: res.deployment.urls.public[0] },
  };
}

// DEV

function deployToRegistry(dir: string, alias?: string) {
  return deploy('tdb', 'os-domains', dir, alias);
}

async function deployModules(paths: string[]) {
  const rewrites: Rewrite[] = [];

  await Promise.all(
    paths.map(async (path) => {
      const res = await deployToRegistry(path);
      rewrites.push({
        source: `/${res.namespace}`,
        destination: `${res.url.public}`,
      });
      rewrites.push({
        source: `/${res.namespace}/:path(.*)`,
        destination: `${res.url.public}/:path*`,
      });
    }),
  );

  return { rewrites };
}

(async () => {
  const sys = fs.resolve('../../pkg.sys');
  console.log('sys', sys);

  const { rewrites } = await deployModules([
    fs.join(sys, 'ui.primitives/dist/web'),
    // fs.join(sys, 'ui.video/dist/web'),
  ]);

  const vercel = {
    cleanUrls: true,
    trailingSlash: false,
    rewrites,
  };

  // Write the redirects
  const json = JSON.stringify(vercel, null, '  ');
  await fs.writeFile(fs.resolve('dist/os.domains/vercel.json'), json);
  await fs.writeFile(fs.resolve('dist/os.domains/index.json'), json);

  // Deploy routes.
  await deployToRegistry('dist/os.domains', 'os.domains');

  console.log('-------------------------------------------');
  console.log('vercel', vercel);
})();
