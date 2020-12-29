import { fs, t } from '../../common';
import { TypeManifest } from '../../manifest';

export const TscManifest = {
  /**
   * Creates and save a type-declaration manifest for the given output directory.
   */
  async generate(args: { outdir: string; model?: t.CompilerModel }) {
    const { outdir, model } = args;
    const info = await TypeManifest.info(model?.entry?.main);
    const { manifest, path } = await TypeManifest.createAndSave({
      base: fs.dirname(outdir),
      dir: fs.basename(outdir),
      model,
      info,
    });
    return { path, manifest, info };
  },
};
