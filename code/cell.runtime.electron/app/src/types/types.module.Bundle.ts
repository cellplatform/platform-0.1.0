import { t, Observable } from './common';

type Uri = string;

export type BundleStatus = {
  host: string;
  cell: Uri;
  dir: string;
  url: string;
  manifest: t.BundleManifest;
};

/**
 * Event API.
 */
export type BundleEvents = t.IDisposable & {
  $: Observable<BundleEvent>;
  is: { base(input: any): boolean };
  status: {
    req$: Observable<BundleStatusReq>;
    res$: Observable<BundleStatusRes>;
    get(args: { dir: string; cell?: Uri | t.ICellUri }): Promise<BundleStatus | undefined>;
  };
  upload: {
    req$: Observable<t.BundleUploadReq>;
    res$: Observable<t.BundleUploadRes>;
    fire(args: { sourceDir: string; targetDir: string; force?: boolean }): Promise<BundleUploadRes>;
  };
};

/**
 * Events
 */
export type BundleEvent =
  | BundleStatusReqEvent
  | BundleStatusResEvent
  | BundleUploadReqEvent
  | BundleUploadResEvent;

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
