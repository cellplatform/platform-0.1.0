import { t } from '../common';
import lib from 'image-size';

export interface ImageSize {
  width: number | undefined;
  height: number | undefined;
  orientation?: number;
  type?: string;
}

export const FileImage = {
  /**
   * Generates image meta-data for the given path.
   */
  async manifestFileImage(fs: t.INodeFs, path: string): Promise<t.ManifestFileImage | undefined> {
    const kind = toImageKind(fs, path);
    if (!kind) return undefined;
    const size = await FileImage.size(path);
    const width = size?.width ?? -1;
    const height = size?.height ?? -1;
    return { kind, width, height };
  },

  /**
   * Calculates the pixel size of an image.
   */
  async size(path: string) {
    type T = ImageSize & { images?: ImageSize[] };
    return new Promise<T | undefined>((resolve, reject) => {
      lib(path, (err, dimensions) => {
        if (err) return reject(err);
        return resolve(dimensions);
      });
    });
  },
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
