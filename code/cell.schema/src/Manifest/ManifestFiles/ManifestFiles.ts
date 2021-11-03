import { t } from '../common';
import { naturalCompare as compare } from './compare';
import { ManifestHash } from '../ManifestHash';

/**
 * Standard operations on a set of files represented by a manifest.
 */
export const ManifestFiles = {
  hash: ManifestHash.files,
  compare,
  sort: (files: t.ManifestFile[]) => [...files].sort((a, b) => compare(a.path, b.path)),
};
