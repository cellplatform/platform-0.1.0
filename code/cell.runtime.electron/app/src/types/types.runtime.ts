import { t } from './common';

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
