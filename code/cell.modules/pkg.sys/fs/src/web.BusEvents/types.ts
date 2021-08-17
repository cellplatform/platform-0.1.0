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
export type SysFsFileDeleteResponse = { path: FilePath; error?: SysFsError };

export type SysFsError = { code: SysFsErrorCode; message: string };
export type SysFsErrorCode = 'client/timeout' | 'info' | 'read' | 'write' | 'delete';

export type SysFsReadResponse = { files: SysFsFileReadResponse[]; error?: SysFsError };
export type SysFsWriteResponse = { files: SysFsFileWriteResponse[]; error?: SysFsError };
export type SysFsDeleteResponse = { files: SysFsFileDeleteResponse[]; error?: SysFsError };

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

  io: t.SysFsEventsIo;
};

export type SysFsEventsIo = {
  read: {
    req$: t.Observable<t.SysFsReadReq>;
    res$: t.Observable<t.SysFsReadRes>;
    get(
      path: FilePath | FilePath[],
      options?: { timeout?: Milliseconds },
    ): Promise<t.SysFsReadResponse>;
  };
  write: {
    req$: t.Observable<t.SysFsWriteReq>;
    res$: t.Observable<t.SysFsWriteRes>;
    fire(
      file: SysFsFile | SysFsFile[],
      options?: { timeout?: Milliseconds },
    ): Promise<t.SysFsWriteResponse>;
  };
  copy: {
    req$: t.Observable<t.SysFsCopyReq>;
    res$: t.Observable<t.SysFsCopyRes>;
  };
  delete: {
    req$: t.Observable<t.SysFsDeleteReq>;
    res$: t.Observable<t.SysFsDeleteRes>;
    fire(
      path: FilePath | FilePath[],
      options?: { timeout?: Milliseconds },
    ): Promise<t.SysFsDeleteResponse>;
  };
};

export type SysFsEvent =
  | SysFsInfoReqEvent
  | SysFsInfoResEvent
  | SysFsReadReqEvent
  | SysFsReadResEvent
  | SysFsWriteReqEvent
  | SysFsWriteResEvent
  | SysFsDeleteReqEvent
  | SysFsDeleteResEvent
  | SysFsCopyReqEvent
  | SysFsCopyResEvent;

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
 * IO: Read
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
 * IO: Write
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

/**
 * IO: Delete
 */
export type SysFsDeleteReqEvent = {
  type: 'sys.fs/delete:req';
  payload: SysFsDeleteReq;
};
export type SysFsDeleteReq = { tx: string; id: FilesystemId; path: FilePath | FilePath[] };

export type SysFsDeleteResEvent = {
  type: 'sys.fs/delete:res';
  payload: SysFsDeleteRes;
};
export type SysFsDeleteRes = {
  tx: string;
  id: FilesystemId;
  files: SysFsFileDeleteResponse[];
  error?: SysFsError;
};

/**
 * IO: Copy
 */
export type SysFsCopyReqEvent = {
  type: 'sys.fs/copy:req';
  payload: SysFsCopyReq;
};
export type SysFsCopyReq = { tx: string; id: FilesystemId };

export type SysFsCopyResEvent = {
  type: 'sys.fs/copy:res';
  payload: SysFsCopyRes;
};
export type SysFsCopyRes = { tx: string; id: FilesystemId };
