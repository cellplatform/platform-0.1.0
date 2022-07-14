import { fs, t, DeployConfig } from './common';
import { deploy } from './Deploy.Vercel';

/**
 * DEPLOY
 */
(async () => {
  const dir = 'dist/web';
  await copyStatic({ dir });
  for (const { team, project, alias } of DeployConfig.Libs) {
    await deploy({ dir, team, project, alias });
  }
})();

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
  const sourcePath = fs.join(targetDir, 'site.libs/index.html');
  const targetPath = fs.join(fs.resolve(fs.join(args.dir, 'index.html')));
  const html = (await fs.readFile(sourcePath))
    .toString()
    .replace(/VERSION/g, `${version}`)
    .replace(/HASH/g, hash);
  await fs.writeFile(targetPath, html);
  await fs.remove(sourcePath);
}
