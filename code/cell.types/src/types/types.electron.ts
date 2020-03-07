import { IServerLog } from '@platform/log/lib/server/types';
import { IResGetSysInfo } from './types.http.router';

export type IElectronLog = IServerLog & {
  file: { path: string };
};

/**
 * HTTP (Server)
 */
export type IResGetElectronSysInfo = IResGetSysInfo & {
  app: IResGetSysInfoElectronApp;
};

export type IResGetSysInfoElectronApp = {
  env?: 'development' | 'production';
  packaged: boolean;
  paths: {
    db: string;
    fs: string;
    log: string;
  };
  versions: {
    node: string;
    electron: string;
    chrome: string;
    v8: string;
  };
};
