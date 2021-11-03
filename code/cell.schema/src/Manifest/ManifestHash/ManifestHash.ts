import { t, Hash } from '../common';

const sha256 = Hash.sha256;

/**
 * Standard generation of a SHA256 hashes.
 */
export const ManifestHash = {
  sha256,

  /**
   * SHA256 hash for a list of files.
   */
  files(input: t.ManifestFile[] | t.Manifest) {
    const files = Array.isArray(input) ? input : input.files;
    const list = files.filter(Boolean).map((file) => file.filehash);
    list.sort();
    return Hash.sha256(list);
  },

  /**
   * SHA256 hash for a [ModuleManifest].
   */
  module(info: t.ModuleManifestInfo, files: t.ManifestFile[]): t.ModuleManifestHash {
    const fileshash = ManifestHash.files(files);
    return {
      files: fileshash,
      module: sha256({ module: info, fileshash }),
    };
  },

  /**
   * SHA256 hash for a [DirManifest].
   */
  dir(info: t.DirManifestInfo, files: t.ManifestFile[]) {
    const fileshash = ManifestHash.files(files);
    return {
      files: fileshash,
      dir: sha256({ module: info, fileshash }),
    };
  },
};
