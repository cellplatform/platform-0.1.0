import { fs, t, Package } from '../../common';

/**
 * Tools for calculating Type file info
 */
export const FileInfo = {
  /**
   * Appends type information to a file-manifest entry.
   */
  async appendManifest(dir: string, file: t.ManifestFile) {
    const res = await FileInfo.readFile(fs.join(dir, file.path));
    const { declaration } = res;
    return { ...file, declaration } as t.TypelibManifestFile;
  },

  /**
   * Derive the file-info for the given path.
   */
  async readFile(path: string) {
    const text = (await fs.readFile(path)).toString();
    const lines = text.split('\n');

    const notRelative = (module: string) => !module.startsWith('.');
    const include = (module: string) => Boolean(module) && notRelative(module);

    const imports = lines.map((line) => toImport(line)).filter(include);
    const exports = lines.map((line) => toExport(line)).filter(include);
    const declaration: t.TypelibManifestFileInfo = { imports, exports };
    const hasRefs = imports.length > 0 || exports.length > 0;

    return { path, declaration, hasRefs };
  },

  /**
   * Return file type-info for an entire directory.
   */
  async readDir(dir: string) {
    const pkg = await Package.findClosestPath(dir);
    const module = pkg?.name || '';
    const paths = await fs.glob.find(`${dir}/**/*.d.ts`);
    const files = await Promise.all(paths.map((path) => FileInfo.readFile(path)));
    return { module, dir, files };
  },
};

/**
 * [Helpers]
 */

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
