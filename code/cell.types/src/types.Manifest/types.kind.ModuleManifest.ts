import { t } from '../common';

type Url = string;
type FilePath = string;

/**
 * Details about a compiled Module ("bundle of code").
 */
export type ModuleManifest = t.Manifest<ModuleManifestFile, ModuleManifestHash> & {
  kind: 'module';
  module: ModuleManifestInfo;
};

export type ModuleManifestHash = t.ManifestHash & {
  module: string; // The hash of all files AND the [ModuleManifestInfo] meta-data.
};

export type ModuleManifestFile = t.ManifestFile;

/**
 * Meta-data describing the bundled code [module].
 */
export type ModuleManifestInfo = {
  namespace: string;
  version: string; //   semver ("0.0.0" if not specified)
  compiler: string; //  "<name>@<version>" (eg "@platform/cell.compiler@0.1.2")
  mode: string; //      "production" | "development"
  target: string; //    "web" | "node"
  entry: FilePath;
  remote?: ModuleManifestRemoteExports;
};

/**
 * Federated "module exports".
 */
export type ModuleManifestRemoteExports = {
  entry: FilePath; // Typically "remoteEntry.js"
  exports: ModuleManifestRemoteExport[];
};
export type ModuleManifestRemoteExport = { path: FilePath };

/**
 * A federated "module export" represented from the
 * consuming side (aka. an "import").
 */
export type ModuleManifestRemoteImport = {
  url: Url;
  namespace: string;
  entry: string;
};
