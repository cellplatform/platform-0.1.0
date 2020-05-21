import * as extract from 'extract-zip';
import * as fsPath from 'path';

/**
 * Unzips an archive.
 */
export function unzip(source: string, target: string) {
  source = fsPath.resolve(source);
  const dir = fsPath.resolve(target);
  return extract(source, { dir });
}
