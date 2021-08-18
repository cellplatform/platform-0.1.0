import { t, Hash } from '../common';

/**
 * Tools for working with hash checksums of a manifest.
 */
export const FileHash = {
  files(input: t.ManifestFile[] | t.Manifest) {
    const files = Array.isArray(input) ? input : input.files;
    const list = files.filter(Boolean).map((file) => file.filehash);
    return Hash.sha256(list);
  },

  /**
   * Calculate the hash of a file.
   */
  async filehash(fs: t.INodeFs, path: string) {
    if (!(await fs.exists(path))) throw new Error(`File not found: ${path}`);
    if (!(await fs.is.file(path))) throw new Error(`Not a file: ${path}`);
    const file = await fs.readFile(path);
    return Hash.sha256(file);
  },
};
