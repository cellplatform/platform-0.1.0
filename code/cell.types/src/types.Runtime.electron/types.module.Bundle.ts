import { t } from './common';

type Uri = string;
type Url = string;
type Path = string;

/**
 * Details of an installed bundle
 */
export type BundleInfo = {
  source: BundleSource;
};

export type BundleSource = BundleSourceLocalPackage | BundleSourceRemote;

export type BundleSourceLocalPackage = {
  kind: 'local:package'; // Bundle packaged and shipped within the electron build.
  manifest: Path;
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
    get(args?: { timeout?: number }): Promise<{ items: BundleListItem[]; error?: string }>;
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
