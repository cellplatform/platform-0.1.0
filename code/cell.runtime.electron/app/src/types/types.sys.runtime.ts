import { t } from './common';

type Uri = string;
type NamespaceUri = Uri; // eg. "ns:<id>"

/**
 * HTTP (Server)
 */
export type IResGetElectronSysInfo = t.IResGetSysInfo & { runtime: ElectronRuntimeInfo };

/**
 * Electron runtime properties.
 */
export type ElectronRuntimeInfo = {
  type: string;
  version: string; // semver
  env?: 'development' | 'production';
  packaged: boolean;
  paths: t.ElectronDataPaths;
  versions: { node: string; electron: string; chrome: string; v8: string };
};

/**
 * System paths
 */
export type ElectronDataPaths = {
  dir: string;
  db: string;
  fs: string;
  config: string; //    Configuration [.json] file.
  archive: string; //   Data backup folder.
  log: string; //       Log output.
};

/**
 * The shape of the application configuration file (JSON).
 */
export type ElectronConfigFile = {
  created: ElectronRuntimeIdentifierLogItem;
  started: ElectronRuntimeIdentifierLogItem[];
  refs: {
    /**
     * The user's "genesis" cell.
     *
     * This is the root entry point for the network of information
     * that grows around the user.
     */
    genesis: NamespaceUri; // eg. "ns:<id>"
  };
};

export type ElectronRuntimeIdentifierLogItem = { process: string; time: number };
