import { t } from './common';

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
