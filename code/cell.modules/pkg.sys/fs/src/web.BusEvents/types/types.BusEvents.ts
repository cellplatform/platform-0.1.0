import { t } from './common';

type Milliseconds = number;
type FilesystemId = string;
type FilePath = string;

/**
 * Events
 */
export type SysFsEvents = t.Disposable & {
  id: FilesystemId;
  $: t.Observable<t.SysFsEvent>;
  is: { base(input: any): boolean };
  info: SysFsEventsInfo;
  io: t.SysFsEventsIo;
};

export type SysFsEventsInfo = {
  req$: t.Observable<t.SysFsInfoReq>;
  res$: t.Observable<t.SysFsInfoRes>;
  get(options?: { path?: FilePath | FilePath[]; timeout?: Milliseconds }): Promise<t.SysFsInfoRes>;
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
      file: t.SysFsFile | t.SysFsFile[],
      options?: { timeout?: Milliseconds },
    ): Promise<t.SysFsWriteResponse>;
  };
  copy: {
    req$: t.Observable<t.SysFsCopyReq>;
    res$: t.Observable<t.SysFsCopyRes>;
    fire(
      file: t.SysFsFileTarget | t.SysFsFileTarget[],
      options?: { timeout?: Milliseconds },
    ): Promise<t.SysFsCopyResponse>;
  };
  move: {
    req$: t.Observable<t.SysFsMoveReq>;
    res$: t.Observable<t.SysFsMoveRes>;
    fire(
      file: t.SysFsFileTarget | t.SysFsFileTarget[],
      options?: { timeout?: Milliseconds },
    ): Promise<t.SysFsMoveResponse>;
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
