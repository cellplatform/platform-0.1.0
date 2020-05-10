import { t } from '../common';
import { IServerLog } from '@platform/log/lib/server/types';
import { IResGetSysInfo } from './types.http.router';

export type IElectronLog = IServerLog & { file: { path: string }; format: IElectronLogFormat };

export type IElectronLogFormat = {
  uri(input?: string | t.IUri): string;
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
