import { fs, t } from '../../common';
import { TypeManifest } from '../../Manifest';

export { TypeManifest };

export const TscManifest: t.TscManifest = {
  /**
   * Determines if a manifest exists within the given directory.
   */
  async exists(dir) {
    dir = (dir || '').trim();
    return fs.pathExists(fs.join(dir, TypeManifest.filename));
  },

  /**
   * Creates and save a type-declaration manifest for the given output directory.
   */
  async generate(args) {
    const { dir } = args;

    const packagePath = fs.join(dir, 'package.json');
    const info = await TypeManifest.info(packagePath);

    const { manifest, path } = await TypeManifest.createAndSave({
      base: fs.dirname(dir),
      dir: fs.basename(dir),
      info,
    });
    return { path, manifest, info };
  },

  /**
   * Check a manifest against the current state of the file-system.
   */
  async validate(dir, manifest) {
    return TypeManifest.validate(dir, manifest);
  },
};
