import { IServerLog } from '@platform/log/lib/server/types';
import { IResGetSysInfo } from '@platform/cell.types';

export type IElectronLog = IServerLog & {
  file: {
    path: string;
  };
};

/**
 * System Info.
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
