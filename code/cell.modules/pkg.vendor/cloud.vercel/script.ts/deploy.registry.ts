import { fs } from '@platform/fs';
import { JSDOM } from 'jsdom';
import { t, Vercel } from 'vendor.vercel/lib/node';

type Rewrite = { source: string; destination: string };

/**
 * Standard JSON stringy output.
 */
const stringify = (input: t.Json) => `${JSON.stringify(input, null, '  ')}\n`;

/**
 * Update the path of <script> tags within an HTML document.
 */
function modifyScriptPath(html: string, options: { prefix?: string } = {}) {
  const prefix = (options.prefix || '').trim().replace(/\/*$/, '');

  const jsdom = new JSDOM(html);
  const doc = jsdom.window.document;
  const head = doc.getElementsByTagName('head')[0];
  const body = doc.getElementsByTagName('body')[0];

  for (const script of head.getElementsByTagName('script')) {
    if (prefix) {
      script.src = `${prefix}/${script.src.replace(/^\/*/, '')}`;
    }
  }

  const parts = ['<!DOCTYPE html>', '<html lang="en">', head.outerHTML, body.outerHTML, '</html>'];
  return parts.join('\n');
}

/**
 * https://vercel.com/docs/cli#project-configuration/routes
 *
 * Route regex:
 *    https://www.npmjs.com/package/path-to-regexp
 */
async function deploy(args: {
  team: string;
  project: string;
  dir: string;
  alias?: string;
  rewriteHtmlPaths?: boolean;
}) {
  const token = process.env.VERCEL_TEST_TOKEN;
  const { team, project, dir, alias } = args;

  const beforeUpload: t.VercelHttpBeforeFileUpload = async (e) => {
    const namespace = manifest?.module?.namespace;

    if (e.path === 'index.html' && args.rewriteHtmlPaths && namespace) {
      const prefix = `/${namespace}`;
      const html = modifyScriptPath(e.toString(), { prefix });
      e.modify(html);
    }
  };

  const size = await fs.size.dir(fs.resolve(dir));
  const deployment = Vercel.Deploy({ token, dir, team, project, beforeUpload });
  const manifest = await deployment.manifest<t.ModuleManifest>();

  console.log('\ndeploying:');
  console.log(' •', dir);
  console.log(' •', `${size.files.length} files, ${size.toString()}`);
  console.log();

  const res = await deployment.commit({
    target: alias ? 'production' : 'staging',
    regions: ['sfo1'],
    alias,
  });

  const status = res.status;
  const { name, urls } = res.deployment;
  const meta = res.deployment.meta as t.VercelHttpDeployMetaModule;

  console.log('-------------------------------------------');
  console.log(status);
  console.log(name);
  console.log('urls', urls);
  console.log();

  return {
    status,
    name,
    namespace: meta.namespace,
    version: meta.version,
    fileshash: meta.fileshash,
    url: { public: urls.public[0] },
  };
}

// DEV
const team = 'tdb';
const project = 'os-domains';

async function deployModules(dirs: string[]) {
  type M = { namespace: string; version: string; fileshash: string };
  const modules: M[] = [];
  const rewrites: Rewrite[] = [];

  await Promise.all(
    dirs.map(async (dir) => {
      const res = await deploy({ team, project, dir, rewriteHtmlPaths: true });

      const { namespace, version, fileshash } = res;
      modules.push({ namespace, version, fileshash });

      rewrites.push({
        source: `/${res.namespace}/:path(.*)?`,
        destination: `${res.url.public}/:path*`,
      });
    }),
  );

  return { modules, rewrites };
}

(async () => {
  const sys = fs.resolve('../../pkg.sys');

  const { modules, rewrites } = await deployModules([
    fs.join(sys, 'ui.primitives/dist/web'),
    fs.join(sys, 'ui.video/dist/web'),
    fs.join(sys, 'ui.code/dist/web'),
  ]);

  const vercel = {
    cleanUrls: true,
    trailingSlash: false,
    rewrites,
  };

  const index = {
    modules: modules.map((m) => ({ ...m, path: `/${m.namespace}` })),
  };

  // Write the redirects
  await fs.writeFile(fs.resolve('dist/os.domains/vercel.json'), stringify(vercel));
  await fs.writeFile(fs.resolve('dist/os.domains/index.json'), stringify(index));

  // Deploy routes.
  await deploy({ team, project, dir: 'dist/os.domains', alias: 'os.domains' });
})();
