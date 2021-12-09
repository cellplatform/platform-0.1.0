import { fs, t, Package } from '../../common';

/**
 * Loads typelib info from the given package.json file.
 */
export const Info = {
  get empty() {
    const info: t.TypelibManifestInfo = { name: '', version: '', entry: '' };
    return info;
  },

  async find(dir: string) {
    const pkg = (await Package.findClosest(dir))?.json;
    return pkg ? Info.fromPackage(pkg) : undefined;
  },

  async loadFile(packageJson: string) {
    const path = fs.resolve(packageJson);
    if (!(await fs.pathExists(path))) return undefined;
    const pkg = (await fs.readJson(path)) as t.NpmPackageJson;
    return Info.fromPackage(pkg);
  },

  fromPackage(pkg: t.NpmPackageJson) {
    const info = Info.empty;
    info.name = pkg.name || '';
    info.version = pkg.version || '';
    info.entry = (pkg.types || '').replace(/\.d\.ts$/, '.d.txt');
    return info;
  },
};
