/**
 * Events
 */
export type NameEvent = NameCommandReqEvent | NameCommandResEvent;

/**
 *
 */
export type NameCommandReqEvent = {
  type: 'module.name/ns/command:req';
  payload: NameCommandReq;
};
export type NameCommandReq = { tx: string };

export type NameCommandResEvent = {
  type: 'module.name/ns/command:res';
  payload: NameCommandRes;
};
export type NameCommandRes = { tx: string; error?: string };
