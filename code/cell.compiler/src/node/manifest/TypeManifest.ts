import { fs, t, R, constants, slug } from '../common';
import { FileManifest, createAndSave } from './FileManifest';

type M = t.FsTypeManifest;

/**
 * Helpers for creating and working with manifest of type declarations (".d.ts" files)
 */
export const TypeManifest = {
  /**
   * The filename of the bundle.
   */
  filename: FileManifest.filename,

  /**
   * Generates a manifest.
   */
  async create(args: {
    sourceDir: string;
    filename?: string;
    model?: t.CompilerModel;
    saveRefs?: boolean;
  }) {
    const { sourceDir, model, filename = TypeManifest.filename } = args;
    const manifest = await FileManifest.create({ sourceDir, model, filename });
    const files = await Promise.all(manifest.files.map((file) => appendTypeInfo(sourceDir, file)));
    return { ...manifest, files } as M;
  },

  /**
   * Write the bundle manifest to the file-system.
   */
  async createAndSave(args: {
    sourceDir: string;
    filename?: string;
    model?: t.CompilerModel;
    copyRefs?: boolean;
  }) {
    const { model, sourceDir, filename } = args;
    const res = await createAndSave<M>({
      create: () => TypeManifest.create({ sourceDir, model, filename }),
      sourceDir,
      filename,
      model,
    });
    if (args.copyRefs) await copyRefs(sourceDir, res.manifest);
    return res;
  },

  /**
   * Reads from file-system.
   */
  async read(args: { dir: string; filename?: string }) {
    return FileManifest.read<M>(args);
  },

  /**
   * Writes a manifest to the file-system.
   */
  async write(args: { manifest: M; dir: string; filename?: string; copyRefs?: boolean }) {
    const res = await FileManifest.write<M>(args);
    if (args.copyRefs) await copyRefs(fs.dirname(args.dir), res.manifest);
    return res;
  },
};

/**
 * Helpers
 */

async function appendTypeInfo(sourceDir: string, input: t.FsManifestFile) {
  const text = (await fs.readFile(fs.join(sourceDir, input.path))).toString();
  const lines = text.split('\n');

  const exists = Boolean;
  const notRelative = (module: string) => !module.startsWith('.');
  const include = (module: string) => exists(module) && notRelative(module);

  const declaration: t.FsTypeManifestFileInfo = {
    imports: lines.map((line) => toImport(line)).filter(include),
    exports: lines.map((line) => toExport(line)).filter(include),
  };

  return { ...input, declaration } as t.FsTypeManifestFile;
}

function toImport(line: string) {
  const match = line.match(/^\s*import .* from '.*';$/g);
  return match ? toModuleRef(line) : '';
}

function toExport(line: string) {
  const match = line.match(/^\s*export .* from '.*';$/g);
  return match ? toModuleRef(line) : '';
}

function toModuleRef(line: string) {
  const match = line.match(/from '.*';/g);
  return match ? match[0].replace(/^from '/, '').replace(/';/, '') : '';
}

async function copyRefs(baseDir: string, manifest: t.FsTypeManifest) {
  // Prepare set of paths.
  let paths: { module: string; source: string }[] = [];
  manifest.files.forEach((file) => {
    paths.push(...file.declaration.imports.map((module) => ({ module, source: '' })));
    paths.push(...file.declaration.exports.map((module) => ({ module, source: '' })));
  });
  paths = R.uniq(paths.filter(Boolean));

  for (const path of paths) {
    path.source = await pathToModule(baseDir, path.module);
    if (!path.source) {
      throw new Error(`Cannot find source declarations for '${path.module}' to copy`);
    }
  }

  // Copy files to temporary location.
  const tmp = fs.join(constants.PATH.TMP, `copyRefs.${slug()}`);
  for (const path of paths) {
    const target = fs.join(tmp, path.module);
    await fs.ensureDir(fs.dirname(target));
    await fs.copy(path.source, target, { dereference: true });
  }

  // Filter on declaration files and copy to final target.
  let declarations = await fs.glob.find(`${tmp}/**/*.d.ts`);
  declarations = declarations.filter((path) => !path.endsWith('.TEST.d.ts'));
  for (const source of declarations) {
    const target = fs.join(baseDir, source.substring(tmp.length));
    if (!(await fs.pathExists(target))) await fs.copy(source, target);
  }

  // Write manifest.
  for (const path of paths) {
    const sourceDir = fs.join(baseDir, path.module);
    await TypeManifest.createAndSave({ sourceDir });
  }

  // Clean up.
  await fs.remove(tmp);
}

async function pathToModule(dir: string, module: string): Promise<string> {
  if (!dir || dir === '/') return '';

  const node_modules = await closestNodeModulesPath(dir);
  if (!node_modules) return '';

  const path = fs.join(node_modules, module);
  if (await fs.pathExists(path)) return path;

  return pathToModule(fs.dirname(dir), module); // <== 🌳 RECURSION
}

async function closestNodeModulesPath(path: string): Promise<string> {
  if (!path || path === '/') return '';
  if (path.endsWith('/node_modules')) return path;
  if (await fs.pathExists(fs.join(path, 'node_modules'))) return fs.join(path, 'node_modules');
  return closestNodeModulesPath(fs.dirname(path)); // <== 🌳 RECURSION
}
