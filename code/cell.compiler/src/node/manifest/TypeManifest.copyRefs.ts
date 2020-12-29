import { fs, R, t, PATH } from '../common';
import { CreateAndSave } from './TypeManifest.types';

const CACHE_DIR = fs.join(PATH.CACHEDIR, 'type-manifest');

/**
 * Copies refs within the given manifest.
 */
export async function copyRefs(
  base: string,
  manifest: t.TypelibManifest,
  createAndSave: CreateAndSave,
  force?: boolean, // Force copy if already cached.
) {
  type D = { module: string; source: string };

  // Prepare the set of paths.
  let dirs: D[] = [];
  manifest.files.forEach((file) => {
    dirs.push(...file.declaration.imports.map((module) => ({ module, source: '' })));
    dirs.push(...file.declaration.exports.map((module) => ({ module, source: '' })));
  });
  dirs = await Promise.all(
    R.uniq(dirs.filter(Boolean)).map(async (path) => {
      path.source = await pathToModule(base, path.module);
      return path;
    }),
  );

  // Ensure all modules have source files.
  const emptySource = dirs.filter((path) => !Boolean(path.source));
  if (emptySource.length > 0) {
    const modules = emptySource.map((path) => `- ${path.module}`).join('\n');
    const err = `Cannot find source declarations (".d.ts") for modules.\nBase folder: ${base}\nModules:\n${modules}`;
    throw new Error(err);
  }

  const target = (dir: D, source: string, options: { cache?: boolean } = {}) => {
    const root = options.cache ? CACHE_DIR : base;
    return fs.join(root, dir.module, source.substring(dir.source.length + 1));
  };

  const isCached = async (dir: D) => await fs.pathExists(target(dir, '', { cache: true }));

  const copyFromCache = async (dir: D) => {
    const from = target(dir, '', { cache: true });
    const to = target(dir, '', { cache: false });
    if (!(await fs.pathExists(to))) await fs.copy(from, to);
  };

  const copyFiles = async (dir: D, options: { copyToCache?: boolean } = {}) => {
    const paths = await fs.glob.find(`${dir.source}/**/*.d.ts`);
    for (const source of paths) {
      await fs.copy(source, target(dir, source));
      if (options.copyToCache) await fs.copy(source, target(dir, source, { cache: true }));
    }
  };

  const copyDir = async (dir: D) => {
    // Check whether the directory is a symbolic-link.
    // NOTE:
    //     YARN uses symbolic links for locally developed modules within a
    //     a "workspace".  If the directory is NOT a symlink then the assumption
    //     is that it can be safely cached and we need not re-calculate the list of
    //     ".d.ts" files (which can be slow for large libraries).
    //
    const isLink = await fs.is.symlink(dir.source, { ancestor: true });
    if (!force && !isLink && (await isCached(dir))) {
      return await copyFromCache(dir);
    }
    await copyFiles(dir, { copyToCache: force || !isLink });
  };

  // Copy files.
  for (const dir of dirs) {
    await copyDir(dir);
  }

  // Generate the manifest index.
  for (const path of dirs) {
    const dir = path.module;
    await createAndSave({ base, dir, copyRefs: true }); // <== 🌳 RECURSION
  }
}

/**
 * [Helpers]
 */

async function pathToModule(dir: string, module: string): Promise<string> {
  if (!dir || dir === '/') return '';

  const node_modules = await closestNodeModulesPath(dir);
  if (!node_modules) return '';

  const path = fs.join(node_modules, module);
  if (await fs.pathExists(path)) return path;
  if (await fs.pathExists(`${path}.d.ts`)) return fs.dirname(path);

  return pathToModule(fs.dirname(dir), module); // <== 🌳 RECURSION
}

async function closestNodeModulesPath(path: string): Promise<string> {
  if (!path || path === '/') return '';
  if (path.endsWith('/node_modules')) return path;
  if (await fs.pathExists(fs.join(path, 'node_modules'))) return fs.join(path, 'node_modules');
  return closestNodeModulesPath(fs.dirname(path)); // <== 🌳 RECURSION
}
