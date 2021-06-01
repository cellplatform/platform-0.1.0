import * as t from '../common/types';

type Uri = string;

export type BundleStatus = {
  host: string;
  cell: Uri;
  dir: string;
  manifest: t.BundleManifest;
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
