import { defaultValue, fs, NodeModules, Package, R, t } from '../../common';
import { toDir } from '../util';
import { TscManifest, TypeManifest } from './TscManifest';

type D = { ref: string; source: string };
type M = t.TypelibManifest;

/**
 * Copies references within the given manifest (import/exports)
 * into folder adjacent to the given manifest.
 */
export const copyRefs: t.TscCopyRefs = async (args): Promise<t.TscCopyRefsResult> => {
  const sourceDir = toDir(args.sourceDir);
  const targetDir = args.targetDir || sourceDir.base;

  const Ref = {
    refs: [] as t.TscCopyRefsResultRef[],

    async moduleName(dir: D) {
      const source = fs.join(dir.source, dir.ref);
      const res = await Package.findClosestPath(source);
      if (!res) {
        throw new Error(`[package.json] directory for module could not be found for: ${source}`);
      }
      return res.name;
    },

    async find(dir: D) {
      const module = await Ref.moduleName(dir);
      return Ref.refs.find((item) => item.module == module);
    },

    async exists(dir: D) {
      const ref = await Ref.find(dir);
      return !ref ? false : ref.to === fs.join(targetDir, dir.ref);
    },

    async add(dir: D, total: number) {
      const ref = await Ref.find(dir);
      if (!ref) {
        const ref: t.TscCopyRefsResultRef = {
          total,
          module: await Ref.moduleName(dir),
          from: fs.join(dir.source, dir.ref),
          to: fs.join(targetDir, dir.ref),
        };
        Ref.refs.push(ref);
        return ref;
      }
      return ref;
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
  dirs = R.uniq(dirs.filter(Boolean));
  dirs = await Promise.all(
    dirs.map(async (dir) => {
      dir.source = await NodeModules.pathToModule(sourceDir.base, dir.ref);
      return dir;
    }),
  );

  // Remove any paths that map into the default node-js types.
  if (dirs.some((dir) => !dir.source)) {
    const node = await NodeModules.nodeJsTypes();
    dirs = dirs.filter((dir) => (dir.source ? true : !node.includes(dir.ref)));
  }

  // Ensure all modules have source files.
  const emptySource = dirs.filter((path) => !path.source);
  if (emptySource.length > 0) {
    const modules = emptySource.map((path) => `- "${path.ref}"`).join('\n');
    const err = `Cannot find source declarations (".d.ts") for modules.\nBase folder: ${sourceDir.base}\nModule:\n${modules}`;
    throw new Error(err);
  }

  const copyFiles = async (dir: D) => {
    const from = await NodeModules.pathToModule(sourceDir.base, dir.ref, { root: true });
    const to = fs.join(targetDir, Package.pathAfterNodeModules(from));
    if (await fs.pathExists(to)) return 0;

    const paths = (await fs.glob.find(`${from}/**/*`))
      .map((path) => path.substring(from.length + 1))
      .filter((path) => {
        if (path.endsWith('.d.ts')) return true;
        if (path === 'package.json') return true;
        if (path === TypeManifest.filename) return true;
        return false;
      });

    await Promise.all(paths.map((path) => fs.copy(fs.join(from, path), fs.join(to, path))));
    return paths.length;
  };

  const copyDir = async (dir: D) => {
    const exists = await Ref.exists(dir);
    if (exists) return; // NB: This is a repeat (already copied, no need to do it again).

    // Copy files.
    const total = await copyFiles(dir);
    if (total > 0) await Ref.add(dir, total);

    // Recurisvely copy references from within the newly copied directory.
    if (total > 0 && defaultValue(args.recursive, true)) {
      const node = await NodeModules.nodeJsTypes();
      const files = (await TypeManifest.file.readDir(dir.source)).files;

      const refs: string[] = files
        .filter((file) => file.hasRefs)
        .map((file) => file.declaration)
        .reduce((acc, next) => [...acc, ...[...next.exports, ...next.imports]], [] as string[])
        .filter((ref) => !node.includes(ref));

      for (const ref of R.uniq(refs)) {
        const source = await NodeModules.pathToModule(sourceDir.base, ref, { root: true });
        await copyDir({ ref, source }); // <== 🌳 RECURSION
      }
    }
  };

  // Perform copy operation.
  for (const dir of dirs) {
    await copyDir(dir);
  }

  // Generate the manifest index.
  await Promise.all(
    Ref.refs.map(async (ref) => {
      const dir = fs.join(targetDir, ref.module);
      await TscManifest.generate({ dir });
    }),
  );

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
