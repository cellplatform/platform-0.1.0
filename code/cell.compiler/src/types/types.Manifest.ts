import { t } from './common';

/**
 * Details about a bundled package.
 */
export type BundleManifest = {
  hash: string;
  mode: t.WpMode;
  target: string;
  entry: string;
  remoteEntry?: string;
  bytes: number;
  files: BundleManifestFile[];
};

export type BundleManifestFile = {
  path: string;
  bytes: number;
  filehash: string;
  uri?: string;
};
