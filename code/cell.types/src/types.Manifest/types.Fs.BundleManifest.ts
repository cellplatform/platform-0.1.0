import { t } from '../common';

/**
 * Details about a compiled bundle of code.
 */
export type FsBundleManifest = t.FsManifest<FsBundleManifestFile> & {
  bundle: FsBundleManifestInfo;
};

export type FsBundleManifestFile = t.FsManifestFile;

export type FsBundleManifestInfo = {
  mode: string; // production | development
  target: string; // web | node
  entry: string;
  remoteEntry?: string;
};
