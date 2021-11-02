import { t, Hash } from '../common';

export const ManifestHash = {
  sha256: Hash.sha256,

  /**
   * Standard generation of hashes for a set of files.
   */
  fileshash(input: t.ManifestFile[] | t.Manifest) {
    const files = Array.isArray(input) ? input : input.files;
    const list = files.filter(Boolean).map((file) => file.filehash);
    list.sort();
    return Hash.sha256(list);
  },
};
