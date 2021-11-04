import { t } from '../common';
import { naturalCompare as compare } from './compare';
import { ManifestHash } from '../ManifestHash';

/**
 * Standard operations on a set of files represented by a manifest.
 */
export const ManifestFiles = {
  hash: ManifestHash.files,
  compare,
  sort<T extends t.ManifestFile | string>(items: T[]) {
    if (items.length === 0) return [];
    return [...items].sort((a, b) => {
      return compare(typeof a === 'string' ? a : a.path, typeof b === 'string' ? b : b.path);
    });
  },
};
