import { log } from '@platform/log/lib/server';
import { fs } from '@platform/fs';
import { semver } from '@platform/cell.compiler';

/**
 *
 * - Find the latest built version
 * - Insert the build architecture into the filename (eg "x64" or "arm64").
 * - Move to the /dmg folder.
 *
 */
(async () => {
  const arch = process.argv[2];
  if (!arch) throw new Error(`An 'arch' argument not provided.`);

  const dir = fs.resolve('./out/make');

  const paths = (await fs.glob.find(`${dir}/A1-*.dmg`))
    .map((path) => {
      const filename = fs.basename(path);
      const version = toVersion(filename);
      const dir = fs.dirname(path);
      return { path, dir, filename, version };
    })
    .sort((a, b) => semver.compare(a.version, b.version));

  const latest = paths[paths.length - 1];
  if (!latest) return;

  const target = {
    dir: fs.join(dir, 'dmg', arch),
    name: `A1-${arch}-${latest.version}.dmg`,
  };

  log.info();
  log.info.gray(`[${log.cyan(arch)} chip] ${log.white(target.name)}`);
  log.info.gray(fs.join(target.dir, target.name));
  log.info();

  await fs.ensureDir(target.dir);
  await fs.copy(latest.path, fs.join(target.dir, target.name));
  await fs.remove(latest.path);
})();

/**
 * Helpers
 */
function toVersion(filename: string) {
  filename = filename.replace(/^A1\-/, '');
  return filename.replace(/\.dmg$/, '');
}
