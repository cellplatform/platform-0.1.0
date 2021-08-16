import * as t from '../web/common/types';

type Milliseconds = number;
type FilesystemId = string;

export type SysFsInfo = {
  id: FilesystemId;
  dir: string; // The root directory of the file-system scope.
};

/**
 * Events
 */

export type SysFsEvents = t.Disposable & {
  id: FilesystemId;
  $: t.Observable<t.SysFsEvent>;
  is: { base(input: any): boolean };

  info: {
    req$: t.Observable<t.SysFsInfoReq>;
    res$: t.Observable<t.SysFsInfoRes>;
    get(options?: { timeout?: Milliseconds }): Promise<SysFsInfoRes>;
  };
};

export type SysFsEvent =
  | SysFsInfoReqEvent
  | SysFsInfoResEvent
  | SysFsReadReqEvent
  | SysFsReadResEvent
  | SysFsWriteReqEvent
  | SysFsWriteResEvent;

/**
 * Compile the project into a bundle.
 */
export type SysFsInfoReqEvent = {
  type: 'sys.fs/info:req';
  payload: t.SysFsInfoReq;
};
export type SysFsInfoReq = { tx: string; id: FilesystemId };

export type SysFsInfoResEvent = {
  type: 'sys.fs/info:res';
  payload: t.SysFsInfoRes;
};
export type SysFsInfoRes = { tx: string; id: FilesystemId; info?: t.SysFsInfo; error?: string };

/**
 * Read a file(s).
 */
export type SysFsReadReqEvent = {
  type: 'sys.fs/read:req';
  payload: SysFsReadReq;
};
export type SysFsReadReq = { tx: string; id: FilesystemId };

export type SysFsReadResEvent = {
  type: 'sys.fs/read:res';
  payload: SysFsReadRes;
};
export type SysFsReadRes = { tx: string; id: FilesystemId; error?: string };

/**
 * Write a file(s).
 */
export type SysFsWriteReqEvent = {
  type: 'sys.fs/write:req';
  payload: SysFsWriteReq;
};
export type SysFsWriteReq = { tx: string; id: FilesystemId };

export type SysFsWriteResEvent = {
  type: 'sys.fs/write:res';
  payload: SysFsWriteRes;
};
export type SysFsWriteRes = { tx: string; id: FilesystemId; error?: string };
