import { fs, PATH, R, t, NodeModules, Package } from '../../common';
import { toDir } from '../util';
import { TscManifest, TypeManifest } from './TscManifest';

type Args = t.TscCopyArgsRefs & { refs?: t.TscCopyRefsResultRef[] };
type D = { ref: string; source: string };
type M = t.TypelibManifest;

const CACHE_DIR = fs.join(PATH.CACHEDIR, 'manifest.typelib');

/**
 * Copies references within the given manifest (import/exports)
 * into folder adjacent to the given manifest.
 */
export const refs: t.TscCopyRefs = async (args: Args): Promise<t.TscCopyRefsResult> => {
  const isRecursion = Boolean(args.refs);
  const sourceDir = toDir(args.sourceDir);
  const targetDir = args.targetDir || sourceDir.base;

  const Ref = {
    refs: args.refs || [],

    async moduleName(dir: D) {
      const source = fs.join(dir.source, dir.ref);
      const res = await Package.findClosest(source);
      if (!res)
        throw new Error(`[package.json] directory for module could not be found for: ${source}`);
      const div = 'node_modules/';
      return res.dir.substring(res.dir.lastIndexOf(div) + div.length);
    },

    async find(dir: D) {
      const module = await Ref.moduleName(dir);
      return Ref.refs.find((item) => item.module == module);
    },

    async exists(dir: D) {
      const ref = await Ref.find(dir);
      return !ref ? false : ref.paths.some((item) => item.to === fs.join(targetDir, dir.ref));
    },

    async add(dir: D) {
      const ref = await Ref.find(dir);
      const from = fs.join(dir.source, dir.ref);
      const to = fs.join(targetDir, dir.ref);
      if (ref) {
        const exists = ref.paths.some((item) => item.to === to);
        if (!exists) ref.paths.push({ from, to });
        return ref;
      } else {
        const ref: t.TscCopyRefsResultRef = {
          module: await Ref.moduleName(dir),
          paths: [{ from, to }],
        };
        Ref.refs.push(ref);
        return ref;
      }
    },
  };

  // Input guard checks.
  if (!(await fs.pathExists(sourceDir.join()))) {
    throw new Error(`Source folder to copy from not found at: ${sourceDir.join()}`);
  }

  const manifestPath = fs.join(sourceDir.join(), TypeManifest.filename);
  if (!(await fs.pathExists(manifestPath))) {
    const err = `Source folder to copy-refs within does not contain an [index.json] manifest: ${manifestPath}`;
    throw new Error(err);
  }

  const manifest = await readManifest(sourceDir.join());
  if (!manifest || manifest.kind !== 'typelib' || !manifest.files) {
    const err = `Source folder to copy-refs within does not contain a valid "typelib" manifest: ${manifestPath}`;
    throw new Error(err);
  }

  // Prepare the set of paths.
  let dirs: D[] = [];
  manifest.files.forEach((file) => {
    dirs.push(...file.declaration.imports.map((ref) => ({ ref, source: '' })));
    dirs.push(...file.declaration.exports.map((ref) => ({ ref, source: '' })));
  });
  dirs = await Promise.all(
    R.uniq(dirs.filter(Boolean)).map(async (path) => {
      path.source = await NodeModules.pathToModule(sourceDir.base, path.ref);
      return path;
    }),
  );

  // Ensure all modules have source files.
  const emptySource = dirs.filter((path) => !Boolean(path.source));
  if (emptySource.length > 0) {
    const modules = emptySource.map((path) => `- ${path.ref}`).join('\n');
    const err = `Cannot find source declarations (".d.ts") for modules.\nBase folder: ${sourceDir.base}\nModules:\n${modules}`;
    throw new Error(err);
  }

  const targetRoot = (options: { cache?: boolean }) => (options.cache ? CACHE_DIR : targetDir);
  const targetFilepath = (dir: D, source: string, options: { cache?: boolean } = {}) => {
    const root = targetRoot(options);
    const path = fs.join(root, dir.ref, source.substring(dir.source.length + 1));
    return path.replace(/\.d\.ts$/, '.d.txt');
  };

  const isCached = async (dir: D) => await fs.pathExists(targetFilepath(dir, '', { cache: true }));

  const copyFromCache = async (dir: D) => {
    const from = targetFilepath(dir, '', { cache: true });
    const to = targetFilepath(dir, '', { cache: false });
    if (!(await fs.pathExists(to))) await fs.copy(from, to);
  };

  const copyPackageJson = async (dir: D, options: { cache?: boolean } = {}) => {
    const pkg = await Package.findClosestPath(dir.source);
    if (pkg) {
      const module = await Ref.moduleName(dir);
      const target = fs.join(targetRoot(options), module, 'package.json');
      await fs.copy(pkg.path, target);
    }
  };

  const copyFiles = async (dir: D, options: { cache?: boolean } = {}) => {
    const { cache } = options;
    const target = (path: string) => targetFilepath(dir, path, { cache });
    const paths = await fs.glob.find(`${dir.source}/**/*.d.ts`);
    await Promise.all(paths.map((source) => fs.copy(source, target(source))));
    await copyPackageJson(dir, { cache });
  };

  const copyDir = async (dir: D) => {
    const exists = await Ref.exists(dir);
    if (exists) return; // NB: This is a repeat (already copied, no need to do it again).
    await Ref.add(dir);

    // Check whether the directory is a symbolic-link.
    // NOTE:
    //     YARN uses symbolic links for locally developed modules within a
    //     a "workspace".  If the directory is NOT a symlink then it is assumed to be
    //     a plain old referenced "external lib" and therefore can be be safely
    //     cached and we need not re-calculate the list of ".d.ts" files
    //     (which can be slow for large libraries).
    //
    //     If it is a symlink, then it is assumed to be a linked workspace module under
    //     development and therefore we must copy it every time (no cache) to ensure
    //     changes are accurately captured.
    //
    //     NB: (🌼 Future Optimization Strategy)
    //         We may be able to use the [yarn.lock] file or some
    //         other checksum within yarn's internals to determine whether
    //         the module has changed since the last time we copied it.
    //
    const isLinkedDir = await isSymbolicLink(dir);

    if (!args.force && !isLinkedDir && (await isCached(dir))) {
      // NB: is cacheable AND already exists within the cache.
      return await copyFromCache(dir);
    }

    await copyFiles(dir);
    if (!isLinkedDir) await copyFiles(dir, { cache: true });
  };

  // Perform copy operation.
  for (const dir of dirs) {
    await copyDir(dir);
  }

  /**
   * TODO 🐷 - recursion / manifest
   * - recursion
   *    - hand the "REFS" list to the recursion call
   * - copy "package.json" from source
   */

  // Generate the manifest index.
  // if (false) {
  if (!isRecursion) {
    const modules = R.uniq(await Promise.all(dirs.map((dir) => Ref.moduleName(dir))));
    for (const module of modules) {
      const dir = fs.join(targetDir, module);
      // const filename = TypeManifest.filename
      // const exists = await fs.pathExists(fs.join(dir, TypeManifest.filename));

      console.log('module', module);

      // console.log();
      // console.log('path', dir);
      // console.log('dirExists', await fs.pathExists(dir));
      // console.log('manifest exists', await fs.pathExists(fs.join(dir, TypeManifest.filename)));

      await TscManifest.generate({ dir });
    }
  }

  // Finish up.
  return {
    source: sourceDir.join(),
    target: targetDir,
    copied: Ref.refs,
  };
};

/**
 * [Helpers]
 */
const readManifest = async (dir: string) => (await TypeManifest.read({ dir })).manifest as M;
const isSymbolicLink = (dir: D) => fs.is.symlink(dir.source, { ancestor: true });
