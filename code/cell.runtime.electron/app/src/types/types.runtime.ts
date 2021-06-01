import { t } from './common';

/**
 * HTTP (Server)
 */
export type IResGetElectronSysInfo = t.IResGetSysInfo & { runtime: ElectronRuntimeInfo };

/**
 * Electron runtime properties.
 */
export type ElectronRuntimeInfo = {
  type: 'cell.runtime.electron';
  version: string; // semver
  env?: 'development' | 'production';
  packaged: boolean;
  paths: { db: string; fs: string; log: string; config: string };
  versions: { node: string; electron: string; chrome: string; v8: string };
};
