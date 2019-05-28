import * as extract from 'extract-zip';
import * as path from 'path';

/**
 * Unzips an archive.
 */
export function unzip(source: string, target: string) {
  return new Promise((resolve, reject) => {
    extract(path.resolve(source), { dir: path.resolve(target) }, err => {
      if (err) {
        reject(err);
      } else {
        resolve();
      }
    });
  });
}
