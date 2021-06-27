import { t } from '../common';

/**
 * Details about a compiled bundle of code.
 */
export type BundleManifest = {
  kind: 'bundle';
  bundle: BundleManifestInfo;
  files: BundleManifestFile[];
  hash: {
    files: string; // NB: The hash of all [filehash]'s in the manifest.
  };
};

export type BundleManifestFile = t.ManifestFile;

export type BundleManifestInfo = {
  namespace: string;
  version: string; // semver ("0.0.0" if not specified)
  mode: string; // production | development
  target: string; // web | node
  entry: string;
  remoteEntry?: string;
};
