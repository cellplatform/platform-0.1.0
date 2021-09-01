import { t } from './common';

type Uri = string;
type Url = string;
type Directory = string;
type Milliseconds = number;

export type FilesystemEvent = FilesystemWriteReqEvent | FilesystemWriteResEvent;

/**
 * Event API.
 */

export type FilesystemEvents = t.Disposable & {
  $: t.Observable<FilesystemEvent>;
  is: { base(input: any): boolean };

  write: {
    req$: t.Observable<t.FilesystemWriteReq>;
    res$: t.Observable<t.FilesystemWriteRes>;
    fire(args: {
      source: Directory;
      target: { host?: string; cell: Uri; dir: Directory };
      force?: boolean;
      silent?: boolean; // Event log.
      timeout?: Milliseconds;
    }): Promise<t.FilesystemWriteRes>;
  };
};

/**
 * Save a bundle of files to an endpoint.
 */
export type FilesystemWriteReqEvent = {
  type: 'runtime.electron/Filesystem/write:req';
  payload: FilesystemWriteReq;
};
export type FilesystemWriteReq = {
  tx?: string;
  source: Directory | Url;
  target: { host?: string; cell: Uri; dir: Directory };
  silent?: boolean;
  force?: boolean; // Re-upload if already exists.
};

export type FilesystemWriteResEvent = {
  type: 'runtime.electron/Filesystem/write:res';
  payload: FilesystemWriteRes;
};
export type FilesystemWriteRes = {
  tx: string;
  ok: boolean;
  action: 'created' | 'replaced' | 'unchanged' | 'error';
  errors: string[];
  source: Directory | Url;
  target: { host: string; cell: Uri; dir: Directory };
  files: { path: string; bytes: number }[];
  elapsed: Milliseconds;
};
