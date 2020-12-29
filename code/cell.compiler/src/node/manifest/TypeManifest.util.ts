import { fs, t } from '../common';

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
    info.entry = pkg.types || '';
    return info;
  },
};

export const Package = {
  /**
   * Walks up a directory path looking for the first [package.json] file.
   */
  async find(dir: string) {
    do {
      const path = fs.join(dir, 'package.json');
      if (await fs.pathExists(path)) return (await fs.readJson(path)) as t.INpmPackageJson;
      dir = dir.substring(0, dir.lastIndexOf('/'));
      if (dir.endsWith('/node_modules')) break;
    } while (dir.length > 0);
    return undefined;
  },
};
