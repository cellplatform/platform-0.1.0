import { deleteUndefined, Hash, t } from '../common';
import { FileHash } from './File.Hash';
import { FileImage } from './File.Image';

export const File = {
  Hash: FileHash,
  Image: FileImage,

  /**
   * Load a file and prepare it for inclusion within a manifest.
   */
  async manifestFile(args: {
    fs: t.INodeFs;
    baseDir: string;
    path: string;
  }): Promise<t.ManifestFile> {
    const { fs } = args;

    // File.
    const file = await fs.readFile(args.path);
    const bytes = file.byteLength;
    const filehash = Hash.sha256(file);
    const path = args.path.substring(args.baseDir.length + 1);

    // Image (NB: Will return [undefined] if not an image-type).
    const image = await FileImage.manifestFileImage(fs, args.path);

    // Finish up.
    return deleteUndefined({ path, filehash, bytes, image });
  },
};
