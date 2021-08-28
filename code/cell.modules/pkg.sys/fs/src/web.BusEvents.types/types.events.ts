import { t } from './common';
import { SysFsIoEvent } from './types.events.io';
import { SysFsIndexEvent } from './types.events.indexer';
import { SysFsCellEvent } from './types.events.cell';

type FilesystemId = string;
type FilePath = string;

/**
 * EVENTS
 */
export type SysFsEvent =
  | SysFsIoEvent
  | SysFsIndexEvent
  | SysFsCellEvent
  | SysFsInfoReqEvent
  | SysFsInfoResEvent;

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
  paths: t.SysFsPathInfo[];
  error?: t.SysFsError;
};
