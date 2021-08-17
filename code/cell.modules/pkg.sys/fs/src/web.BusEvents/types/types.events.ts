import { t } from './common';
import { SysFsIoEvent } from './types.events.io';

type FilesystemId = string;
type FilePath = string;

export type SysFsEvent = SysFsInfoReqEvent | SysFsInfoResEvent | SysFsIoEvent;

/**
 * Compile the project into a bundle.
 */
export type SysFsInfoReqEvent = {
  type: 'sys.fs/info:req';
  payload: t.SysFsInfoReq;
};
export type SysFsInfoReq = { tx: string; id: FilesystemId; path?: FilePath | FilePath[] };

export type SysFsInfoResEvent = {
  type: 'sys.fs/info:res';
  payload: t.SysFsInfoRes;
};
export type SysFsInfoRes = {
  tx: string;
  id: FilesystemId;
  fs?: t.SysFsInfo;
  files: t.SysFsFileInfo[];
  error?: t.SysFsError;
};
