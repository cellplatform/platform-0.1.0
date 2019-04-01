import { IpcClient } from '@platform/electron/lib/types';

export { IpcClient };
export type NpmIpcClient = IpcClient<NpmIpcMessage>;

/**
 * IPC Events
 */
export type NpmIpcMessage = IFooEvent;

export type IFooEvent = {
  type: 'NPM/foo';
  payload: {};
};
