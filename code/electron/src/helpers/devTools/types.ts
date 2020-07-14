export { IContext, IpcInternal, IpcClient, ILog, IWindows } from '../types';

/**
 * IPC Events.
 */
export type DevToolEvents = DevToolsClearConsoleEvent | DevToolsVisibilityEvent;

export type DevToolsClearConsoleEvent = {
  type: '@platform/DEV_TOOLS/clearConsole';
  payload: Record<string, undefined>; // NB: Placeholder {object} type.
};

export type DevToolsVisibilityEvent = {
  type: '@platform/DEV_TOOLS/visibility';
  payload: { show: boolean; focus?: boolean };
};
