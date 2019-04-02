import { IpcClient } from '@platform/electron/lib/types';

export { IpcClient, IMainLog } from '@platform/electron/lib/types';
export { IpcClientSendOptions } from '@platform/electron';

export type NpmIpc = IpcClient<NpmMessage>;

/**
 * IPC Events
 */
export type NpmMessage = INpmInstall;

export type INpmInstall = {
  type: 'NPM/install';
  payload: {
    name: string;
    version?: string;
  };
};
