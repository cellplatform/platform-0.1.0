import { t } from './common';
import { IServerLog } from '@platform/log/lib/server/types';

export type IElectronPaths = {
  dir: string;
  db: string;
  fs: string;
  config: string;
  archive: string;
};

/**
 * [Logging]
 */
export type IElectronLog = IServerLog & { file: { path: string }; format: IElectronLogFormat };
export type IElectronLogFormat = { uri(input?: string | t.IUri): string };
