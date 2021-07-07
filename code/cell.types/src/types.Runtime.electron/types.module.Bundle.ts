import { t } from './common';

type Uri = string;
type Url = string;
type Filepath = string;
type Directory = string;
type ManifestSourcePath = Url | Filepath;
type Milliseconds = number;

/**
 * Info about an installed bundle.
 */
export type BundleStatus = {
  latest: boolean;
  compiler: string;
  module: BundleItem;
  urls: { manifest: string; entry: string };
};

export type BundleItem = {
  hash: string;
  domain: string;
  namespace: string;
  version: string;
  fs: Uri;
};

/**
 * Event API.
 */
export type BundleEvents = t.IDisposable & {
  $: t.Observable<BundleEvent>;
  is: { base(input: any): boolean };

  install: {
    req$: t.Observable<BundleInstallReq>;
    res$: t.Observable<BundleInstallRes>;
    fire(
      source: ManifestSourcePath,
      options?: { timeout?: number; force?: boolean },
    ): Promise<t.BundleInstallRes>;
  };

  list: {
    req$: t.Observable<BundleListReq>;
    res$: t.Observable<BundleListRes>;
    get(options?: {
      domain?: string;
      timeout?: number;
    }): Promise<{ items: BundleItem[]; error?: string }>;
  };

  status: {
    req$: t.Observable<BundleStatusReq>;
    res$: t.Observable<BundleStatusRes>;
    get(args: {
      domain: string;
      namespace: string;
      version?: string;
      timeout?: number;
    }): Promise<BundleStatusRes>;
  };

  fs: {
    save: {
      req$: t.Observable<t.BundleFsSaveReq>;
      res$: t.Observable<t.BundleFsSaveRes>;
      fire(args: {
        source: Directory;
        target: { cell: Uri; dir: Directory };
        force?: boolean;
        silent?: boolean; // Event log.
      }): Promise<BundleFsSaveRes>;
    };
  };
};

/**
 * Events
 */
export type BundleEvent =
  | BundleListReqEvent
  | BundleListResEvent
  | BundleInstallReqEvent
  | BundleInstallResEvent
  | BundleStatusReqEvent
  | BundleStatusResEvent
  | BundleFsSaveReqEvent
  | BundleFsSaveResEvent;

/**
 * Retrieve a list of installed modules.
 */
export type BundleListReqEvent = {
  type: 'runtime.electron/Bundle/list:req';
  payload: BundleListReq;
};
export type BundleListReq = { tx?: string; domain?: string | string[] };

export type BundleListResEvent = {
  type: 'runtime.electron/Bundle/list:res';
  payload: BundleListRes;
};
export type BundleListRes = { tx: string; items: BundleItem[]; error?: string };

/**
 * Install a module (new or version update)
 */
export type BundleInstallReqEvent = {
  type: 'runtime.electron/Bundle/install:req';
  payload: BundleInstallReq;
};
export type BundleInstallReq = { tx?: string; source: ManifestSourcePath; force?: boolean };

export type BundleInstallResEvent = {
  type: 'runtime.electron/Bundle/install:res';
  payload: BundleInstallRes;
};
export type BundleInstallRes = {
  tx: string;
  ok: boolean;
  action: 'created' | 'replaced' | 'unchanged' | 'error';
  source: ManifestSourcePath;
  module?: BundleItem;
  elapsed: Milliseconds;
  errors: string[];
};

/**
 * Retrieve the status of a bundle.
 */
export type BundleStatusReqEvent = {
  type: 'runtime.electron/Bundle/status:req';
  payload: BundleStatusReq;
};
export type BundleStatusReq = {
  tx?: string;
  domain: string;
  namespace: string;
  version?: string;
};

export type BundleStatusResEvent = {
  type: 'runtime.electron/Bundle/status:res';
  payload: BundleStatusRes;
};
export type BundleStatusRes = {
  tx: string;
  exists: boolean;
  status?: BundleStatus;
  error?: string;
};

/**
 * Save a bundle of files to an endpoint.
 */
export type BundleFsSaveReqEvent = {
  type: 'runtime.electron/Bundle/fs/save:req';
  payload: BundleFsSaveReq;
};
export type BundleFsSaveReq = {
  tx?: string;
  source: Directory | Url;
  target: { cell: Uri; dir: Directory };
  silent?: boolean;
  force?: boolean; // Re-upload if already exists.
};

export type BundleFsSaveResEvent = {
  type: 'runtime.electron/Bundle/fs/save:res';
  payload: BundleFsSaveRes;
};
export type BundleFsSaveRes = {
  tx: string;
  ok: boolean;
  files: { path: string; bytes: number }[];
  cell: Uri;
  errors: string[];
  action: 'created' | 'replaced' | 'unchanged' | 'error';
  elapsed: Milliseconds;
};
