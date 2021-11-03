import { t, Hash } from '../common';

/**
 * Tools for working with hash checksums of a manifest.
 */
export const ManifestFileHash = {
  /**
   * Calculate the hash of a file.
   */
  async filehash(fs: t.INodeFs, path: string) {
    return (await loadFile(fs, path)).hash;
  },
};

/**
 * Load file and calculate the file SHA256 hash meta-data.
 */
export async function loadFile(fs: t.INodeFs, path: string) {
  if (!(await fs.exists(path))) throw new Error(`File not found: ${path}`);
  if (!(await fs.is.file(path))) throw new Error(`Not a file: ${path}`);

  const data = Uint8Array.from(await fs.readFile(path));
  const hash = Hash.sha256(data);
  const bytes = data.byteLength;
  return { bytes, hash, data };
}
