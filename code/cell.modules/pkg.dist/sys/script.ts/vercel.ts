import { fs } from '@platform/fs';
import { Vercel, t } from 'vendor.cloud.vercel/lib/node';

const token = process.env.VERCEL_TEST_TOKEN || '';

/**
 * https://vercel.com/docs/cli#project-configuration/routes
 *
 * Route regex:
 *    https://www.npmjs.com/package/path-to-regexp
 *
 */
export async function deploy(team: string, project: string, alias: string) {
  const dir = 'dist/web';
  const deployment = Vercel.Deploy({ token, dir, team, project });
  const info = (await deployment.info()) as t.VercelSourceBundleInfo;

  await copyStatic({ dir });
  Vercel.Log.beforeDeploy({ info, alias, project });

  const res = await deployment.commit(
    { target: 'production', regions: ['sfo1'], alias },
    { ensureProject: true },
  );

  // Finish up.
  Vercel.Log.afterDeploy(res);
}

/**
 * Helpers
 */

async function copyStatic(args: { dir: string }) {
  type M = t.ModuleManifest;

  // Read in meta-data from the manifest.
  const manifest = (await fs.readJson(fs.resolve(fs.join(args.dir, 'index.json')))) as M;
  const version = manifest.module.version;
  const hash = `module(${manifest.hash.module})`.replace(/^sha256-/, '');

  // Copy files.
  const sourceDir = fs.resolve('static');
  const targetDir = fs.resolve(fs.join(args.dir, 'static'));
  await fs.remove(targetDir);
  await fs.copy(sourceDir, targetDir);

  // Rewrite template values within HTML and insert into root.
  const sourcePath = fs.join(targetDir, 'site/index.html');
  const targetPath = fs.join(fs.resolve(fs.join(args.dir, 'index.html')));
  const html = (await fs.readFile(sourcePath))
    .toString()
    .replace(/VERSION/g, `${version}`)
    .replace(/HASH/g, hash);
  await fs.writeFile(targetPath, html);
  await fs.remove(sourcePath);
}
