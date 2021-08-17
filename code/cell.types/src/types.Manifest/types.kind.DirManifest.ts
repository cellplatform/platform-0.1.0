import { t } from '../common';

type Timestamp = number; // UTC: milliseconds since the UNIX epoch.

/**
 * Details about a compiled Module ("bundle of code").
 */
export type DirManifest = t.Manifest<DirManifestFile, DirManifestHash> & {
  kind: 'dir';
  dir: DirManifestInfo;
};

export type DirManifestHash = t.ManifestHash & {
  dir: string; // The hash of all files AND the [DirInfo] meta-data.
};

export type DirManifestFile = t.ManifestFile;

export type DirManifestInfo = {
  indexedAt: Timestamp;
};
