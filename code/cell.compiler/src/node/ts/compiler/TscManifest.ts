import { fs, t } from '../../common';
import { TypeManifest } from '../../manifest';

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
    const { dir, model } = args;
    const info = await TypeManifest.info(model?.entry?.main);
    const { manifest, path } = await TypeManifest.createAndSave({
      base: fs.dirname(dir),
      dir: fs.basename(dir),
      model,
      info,
    });
    return { path, manifest, info };
  },

  /**
   * Check a manifest against the current state of the file-system.
   */
  async validate(dir, manifest) {
    return TypeManifest.hash.validate(dir, manifest);
  },
};
