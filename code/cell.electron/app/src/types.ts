import { IServerLog } from '@platform/log/lib/server/types';

export type IElectronLog = IServerLog & {
  file: {
    path: string;
  };
};
