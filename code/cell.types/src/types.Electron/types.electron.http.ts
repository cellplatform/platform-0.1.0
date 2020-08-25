import { t } from '../common';

/**
 * HTTP (Server)
 */
export type IResGetElectronSysInfo = t.IResGetSysInfo & {
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
