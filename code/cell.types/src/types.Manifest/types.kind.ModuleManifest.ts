import { t } from '../common';

/**
 * Details about a compiled Module ("bundle of code").
 */
export type ModuleManifest = t.Manifest<ModuleManifestFile, ModuleManifestHash> & {
  kind: 'module';
  module: ModuleManifestInfo;
};

export type ModuleManifestHash = t.ManifestHash & {
  module: string; // The hash of all files AND the [ModuleInfo] meta-data.
};

export type ModuleManifestFile = t.ManifestFile;

export type ModuleManifestInfo = {
  namespace: string;
  version: string; // semver ("0.0.0" if not specified)
  mode: string; // production | development
  target: string; // web | node
  entry: string;
  remoteEntry?: string;
};
