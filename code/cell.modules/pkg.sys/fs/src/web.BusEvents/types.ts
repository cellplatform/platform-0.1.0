import * as t from '../web/common/types';

type Milliseconds = number;
type FilesystemId = string;
type FilePath = string;

export type SysFsInfo = {
  id: FilesystemId;
  dir: string; // The root directory of the file-system scope.
};

export type SysFsFileInfo = {
  path: FilePath;
  exists: boolean | null;
  hash: string;
  bytes: number;
  error?: SysFsError;
};

export type SysFsFile = { path: FilePath; data: Uint8Array; hash: string };

export type SysFsFileReadResponse = { file?: SysFsFile; error?: SysFsError };
export type SysFsFileWriteResponse = { path: FilePath; error?: SysFsError };

export type SysFsError = { code: SysFsErrorCode; message: string };
export type SysFsErrorCode = 'client/timeout' | 'read' | 'write' | 'info';

export type SysFsReadResponse = { files: SysFsFileReadResponse[]; error?: SysFsError };
export type SysFsWriteResponse = { files: SysFsFileWriteResponse[]; error?: SysFsError };

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
    get(options?: { path?: FilePath | FilePath[]; timeout?: Milliseconds }): Promise<SysFsInfoRes>;
  };

  io: {
    read: {
      req$: t.Observable<t.SysFsReadReq>;
      res$: t.Observable<t.SysFsReadRes>;
      get(
        path: FilePath | FilePath[],
        options?: { timeout?: Milliseconds },
      ): Promise<SysFsReadResponse>;
    };
    write: {
      req$: t.Observable<t.SysFsWriteReq>;
      res$: t.Observable<t.SysFsWriteRes>;
      fire(
        file: SysFsFile | SysFsFile[],
        options?: { timeout?: Milliseconds },
      ): Promise<SysFsWriteResponse>;
    };
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
  error?: SysFsError;
};

/**
 * Read a file(s).
 */
export type SysFsReadReqEvent = {
  type: 'sys.fs/read:req';
  payload: SysFsReadReq;
};
export type SysFsReadReq = { tx: string; id: FilesystemId; path: FilePath | FilePath[] };

export type SysFsReadResEvent = {
  type: 'sys.fs/read:res';
  payload: SysFsReadRes;
};
export type SysFsReadRes = {
  tx: string;
  id: FilesystemId;
  files: SysFsFileReadResponse[];
  error?: SysFsError;
};

/**
 * Write a file(s).
 */
export type SysFsWriteReqEvent = {
  type: 'sys.fs/write:req';
  payload: SysFsWriteReq;
};
export type SysFsWriteReq = { tx: string; id: FilesystemId; file: SysFsFile | SysFsFile[] };

export type SysFsWriteResEvent = {
  type: 'sys.fs/write:res';
  payload: SysFsWriteRes;
};
export type SysFsWriteRes = {
  tx: string;
  id: FilesystemId;
  files: SysFsFileWriteResponse[];
  error?: SysFsError;
};
