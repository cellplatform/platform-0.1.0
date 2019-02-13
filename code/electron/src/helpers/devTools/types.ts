export { IContext, IpcInternal, IpcClient } from '../types';

/**
 * IPC Events.
 */
export type DevToolEvents = ClearConsoleEvent;

export type ClearConsoleEvent = {
  type: '@platform/DEV_TOOLS/clearConsole';
  payload: {};
};
