import { t } from '../common';

/**
 * Details about a compiled bundle of code.
 */
export type BundleManifest = t.Manifest<BundleManifestFile> & {
  kind: 'bundle';
  bundle: BundleManifestInfo;
};

export type BundleManifestFile = t.ManifestFile;

export type BundleManifestInfo = {
  mode: string; // production | development
  target: string; // web | node
  entry: string;
  remoteEntry?: string;
};
