export { IContext, IpcInternal, IpcClient } from '../types';

/**
 * IPC Events.
 */
export type DevToolEvents = ClearConsoleEvent;

export type ClearConsoleEvent = {
  type: '.SYS/DEV_TOOLS/clearConsole';
  payload: {};
};
