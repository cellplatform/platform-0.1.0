import lib from 'image-size';

interface ImageSize {
  width: number | undefined;
  height: number | undefined;
  orientation?: number;
  type?: string;
}

type T = ImageSize & { images?: ImageSize[] };

/**
 * Calculates the pixel size of an image.
 */
export async function sizeOfImage(path: string) {
  return new Promise<T | undefined>((resolve, reject) => {
    lib(path, (err, dimensions) => {
      if (err) return reject(err);
      return resolve(dimensions);
    });
  });
}
