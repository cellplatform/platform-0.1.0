import { t } from '../common';

/**
 * Details about a compiled bundle of code.
 */
export type BundleManifest = t.FsManifest & { bundle: BundleManifestInfo };

export type BundleManifestInfo = {
  mode: string; // production | development
  target: string; // web | node
  entry: string;
  remoteEntry?: string;
};
