/**
 * Events
 */
export type MenuEvent = MenuCommandReqEvent | MenuCommandResEvent;

/**
 *
 */
export type MenuCommandReqEvent = {
  type: 'runtime.electron/Menu/command:req';
  payload: MenuCommandReq;
};
export type MenuCommandReq = {
  tx?: string;
};

export type MenuCommandResEvent = {
  type: 'runtime.electron/Menu/command:res';
  payload: MenuCommandRes;
};
export type MenuCommandRes = {
  tx: string;
};
