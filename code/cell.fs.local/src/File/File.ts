import { t, Hash, deleteUndefined } from '../common';
import { FileHash } from './FileHash';
import lib from 'image-size';

interface ImageSize {
  width: number | undefined;
  height: number | undefined;
  orientation?: number;
  type?: string;
}

export const File = {
  /**
   * Load a file and prepare it for inclusion within a manifest.
   */
  async toManifestFile(args: {
    fs: t.INodeFs;
    baseDir: string;
    path: string;
  }): Promise<t.ManifestFile> {
    const { fs } = args;
    const file = await fs.readFile(args.path);
    const bytes = file.byteLength;
    const filehash = Hash.sha256(file);
    const path = args.path.substring(args.baseDir.length + 1);
    return deleteUndefined({
      path,
      bytes,
      filehash,
      image: await File.toImage(fs, args.path),
    });
  },

  /**
   * Generates image meta-data for the given path.
   */
  async toImage(fs: t.INodeFs, path: string): Promise<t.ManifestFileImage | undefined> {
    const kind = toImageKind(fs, path);
    if (!kind) return undefined;
    const size = await File.sizeOfImage(path);
    const width = size?.width ?? -1;
    const height = size?.height ?? -1;
    return { kind, width, height };
  },

  /**
   * Calculates the pixel size of an image.
   */
  async sizeOfImage(path: string) {
    type T = ImageSize & { images?: ImageSize[] };
    return new Promise<T | undefined>((resolve, reject) => {
      lib(path, (err, dimensions) => {
        if (err) return reject(err);
        return resolve(dimensions);
      });
    });
  },

  /**
   * Tools for working with hash checksums of a manifest.
   */
  Hash: FileHash,
};

/**
 * Helpers
 */

function toImageKind(fs: t.INodeFs, path: string) {
  type K = t.ManifestFileImage['kind'];
  const kinds = ['.jpg', '.png', '.svg'];
  let ext = fs.extname(path).toLowerCase();
  ext = ext === '.jpeg' ? '.jpg' : ext;
  return kinds.includes(ext) ? (ext.replace(/^\./, '') as K) : undefined;
}
