import { fs, t } from '../../common';
import { Package } from './util.Package';

/**
 * Loads typelib info from the given package.json file.
 */
export const Info = {
  get empty() {
    const info: t.TypelibManifestInfo = { name: '', version: '', entry: '' };
    return info;
  },

  async find(dir: string) {
    const pkg = await Package.find(dir);
    return pkg ? Info.fromPackage(pkg) : undefined;
  },

  async loadFile(packageJson: string) {
    const path = fs.resolve(packageJson);
    const pkg = (await fs.readJson(path)) as t.INpmPackageJson;
    return Info.fromPackage(pkg);
  },

  fromPackage(pkg: t.INpmPackageJson) {
    const info = Info.empty;
    info.name = pkg.name || '';
    info.version = pkg.version || '';
    info.entry = (pkg.types || '').replace(/\.d\.ts$/, '.d.txt');
    return info;
  },
};
