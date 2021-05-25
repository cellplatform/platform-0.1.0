import { t } from './common';

/**
 * HTTP (Server)
 */
export type IResGetElectronSysInfo = t.IResGetSysInfo & { runtime: IElectronRuntimeInfo };

/**
 * Electron runtime properties.
 */
export type IElectronRuntimeInfo = {
  type: 'cell.runtime.electron';
  version: string; // semver
  env?: 'development' | 'production';
  packaged: boolean;
  paths: { db: string; fs: string; log: string; config: string };
  versions: { node: string; electron: string; chrome: string; v8: string };
};
