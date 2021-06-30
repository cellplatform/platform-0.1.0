import { t } from './common';

type Uri = string;
type Url = string;
type Filepath = string;

export type BundleSource = BundleSourceLocalPackage | BundleSourceRemote;

export type BundleSourceLocalPackage = {
  kind: 'local:package'; // Bundle packaged and shipped within the electron build.
  manifest: Filepath;
};

export type BundleSourceRemote = {
  kind: 'remote';
  manifest: Url;
};

/**
 * Info about an installed bundle.
 */
export type BundleStatus = {
  host: string;
  cell: Uri;
  dir: string;
  url: string;
  manifest: t.ModuleManifest;
};

/**
 * Event API.
 */
export type BundleEvents = t.IDisposable & {
  $: t.Observable<BundleEvent>;
  is: { base(input: any): boolean };
  list: {
    req$: t.Observable<BundleListReq>;
    res$: t.Observable<BundleListRes>;
    get(options?: { timeout?: number }): Promise<{ items: BundleListItem[]; error?: string }>;
  };
  put: {
    req$: t.Observable<BundlePutReq>;
    res$: t.Observable<BundlePutRes>;
    add(source: t.BundleSource, options?: { timeout?: number }): Promise<t.BundlePutRes>;
  };
  status: {
    req$: t.Observable<BundleStatusReq>;
    res$: t.Observable<BundleStatusRes>;
    get(args: { dir: string; cell?: Uri | t.ICellUri }): Promise<BundleStatus | undefined>;
  };
  upload: {
    req$: t.Observable<t.BundleUploadReq>;
    res$: t.Observable<t.BundleUploadRes>;
    fire(args: { sourceDir: string; targetDir: string; force?: boolean }): Promise<BundleUploadRes>;
  };
};

/**
 * Events
 */
export type BundleEvent =
  | BundleListReqEvent
  | BundleListResEvent
  | BundlePutReqEvent
  | BundlePutResEvent
  | BundleStatusReqEvent
  | BundleStatusResEvent
  | BundleUploadReqEvent
  | BundleUploadResEvent;

/**
 * Retrieve a list of installed modules.
 */
export type BundleListReqEvent = {
  type: 'runtime.electron/Bundle/list:req';
  payload: BundleListReq;
};
export type BundleListReq = { tx?: string };

export type BundleListResEvent = {
  type: 'runtime.electron/Bundle/list:res';
  payload: BundleListRes;
};
export type BundleListRes = { tx: string; items: BundleListItem[]; error?: string };
export type BundleListItem = { namespace: string; version: string; hash: string };

/**
 * Write module changes to the database (add/update).
 */
export type BundlePutReqEvent = {
  type: 'runtime.electron/Bundle/put:req';
  payload: BundlePutReq;
};
export type BundlePutReq = { tx?: string } & (BundlePutReqAdd | BundlePutReqUpdate);
export type BundlePutReqAdd = { action: 'add'; source: BundleSource };
export type BundlePutReqUpdate = { action: 'update' };

export type BundlePutResEvent = {
  type: 'runtime.electron/Bundle/put:res';
  payload: BundlePutRes;
};
export type BundlePutRes = { tx: string; error?: string };

/**
 * Retrieve the status of a bundle.
 */
export type BundleStatusReqEvent = {
  type: 'runtime.electron/Bundle/status:req';
  payload: BundleStatusReq;
};
export type BundleStatusReq = {
  tx?: string;
  dir: string;
  cell?: Uri;
};

export type BundleStatusResEvent = {
  type: 'runtime.electron/Bundle/status:res';
  payload: BundleStatusRes;
};
export type BundleStatusRes = {
  tx: string;
  exists: boolean;
  status?: BundleStatus;
};

/**
 * Upload a bundle of files to an endpoint.
 */
export type BundleUploadReqEvent = {
  type: 'runtime.electron/Bundle/upload:req';
  payload: BundleUploadReq;
};
export type BundleUploadReq = {
  tx?: string;
  sourceDir: string;
  targetDir: string;
  silent?: boolean;
  force?: boolean; // Re-upload if already exists.
};

export type BundleUploadResEvent = {
  type: 'runtime.electron/Bundle/upload:res';
  payload: BundleUploadRes;
};
export type BundleUploadRes = {
  tx: string;
  ok: boolean;
  files: { path: string; bytes: number }[];
  errors: string[];
  action: 'written' | 'replaced' | 'unchanged';
};
