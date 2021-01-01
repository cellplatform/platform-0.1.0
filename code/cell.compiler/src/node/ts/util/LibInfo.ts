import { fs, t, Package } from '../../common';

/**
 * Loads typelib info from the given [package.json] file.
 */
export const LibInfo = {
  get empty(): t.TypelibManifestInfo {
    return { name: '', version: '', entry: '' };
  },

  async loadFile(packageJson: string) {
    const path = fs.resolve(packageJson);
    const pkg = (await fs.readJson(path)) as t.INpmPackageJson;
    return LibInfo.fromPackage(pkg);
  },

  async findFromPackage(dir: string) {
    const pkg = (await Package.findClosest(dir))?.json;
    return pkg ? LibInfo.fromPackage(pkg) : undefined;
  },

  fromPackage(pkg: t.INpmPackageJson) {
    const info = LibInfo.empty;
    info.name = pkg.name || '';
    info.version = pkg.version || '';
    info.entry = (pkg.types || '').replace(/\.d\.ts$/, '.d.txt');
    return info;
  },
};
