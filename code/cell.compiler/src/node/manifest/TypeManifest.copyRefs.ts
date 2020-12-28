import { constants, fs, R, slug, t } from '../common';

export type CreateAndSave = (args: CreateAndSaveArgs) => Promise<CreateAndSaveResponse>;
export type CreateAndSaveResponse = { path: string; manifest: t.TypeManifest };
export type CreateAndSaveArgs = {
  base: string;
  dir: string;
  filename?: string; // Default: index.json
  model?: t.CompilerModel;
  copyRefs?: boolean;
};

/**
 * Copies refs within the given manifest.
 */
export async function copyRefs(
  base: string,
  manifest: t.TypeManifest,
  createAndSave: CreateAndSave,
) {
  // Prepare set of paths.
  let paths: { module: string; source: string }[] = [];
  manifest.files.forEach((file) => {
    paths.push(...file.declaration.imports.map((module) => ({ module, source: '' })));
    paths.push(...file.declaration.exports.map((module) => ({ module, source: '' })));
  });
  paths = R.uniq(paths.filter(Boolean));

  // paths = paths.filter((p) => p.module !== 'rxjs');

  for (const path of paths) {
    path.source = await pathToModule(base, path.module);
    if (!path.source) {
      throw new Error(
        `Cannot find source declarations for '${path.module}' to copy. Base: ${base}`,
      );
    }
  }

  // Copy files to temporary location.
  const tmp = fs.join(constants.PATH.TMP, `copyRefs.${slug()}`);
  for (const path of paths) {
    const target = fs.join(tmp, path.module);
    await fs.ensureDir(fs.dirname(target));
    await fs.copy(path.source, target, { dereference: true }); // NB: Handle sym-links, which will happen when Yarn workspaces are in use.
  }

  // Filter on declaration files and copy to final target.
  let declarations = await fs.glob.find(`${tmp}/**/*.d.ts`);
  declarations = declarations.filter((path) => !path.endsWith('.TEST.d.ts'));
  for (const source of declarations) {
    const target = fs.join(base, source.substring(tmp.length));
    if (!(await fs.pathExists(target))) await fs.copy(source, target);
  }

  // Clean up temp folder.
  await fs.remove(tmp);

  // Write manifest.
  for (const path of paths) {
    await createAndSave({
      base,
      dir: path.module,
      // copyRefs: true, // todo
      copyRefs: false,
    }); // <== 🌳 RECURSION
  }
}

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
