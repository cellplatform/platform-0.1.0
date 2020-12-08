import { t } from '../common';

/**
 * POST: Execute Function(s).
 */
export type IReqQueryFuncRun = {
  pull?: boolean; //     Sets "pull" flag when not specified within body payload.
  silent?: boolean; //   Sets "silent" flag when not specified within body payload.
  timeout?: number; //   Sets "timeout" (msecs) when not specified within body payload.
};

export type IReqPostFuncSet = IReqPostFuncSerial | IReqPostFuncParallel;
export type IReqPostFuncSerial = t.IReqPostFuncCall[]; // Piped list of functions.
export type IReqPostFuncParallel = { [key: string]: t.IReqPostFuncCall }; // Paralell execution (arbitrary key value).

export type IReqPostFuncCall = {
  uri: string; // Cell URI containing bundle.
  host?: string; // NB: the running system's host is used if not specified.
  dir?: string; // Directory of the cell.
  entry?: string; // Entry path within bundle (if not specified default manfest entry is used).
  hash?: string; // The hash of the bundle to match before executing.
  tx?: string; // Execution transaction ID (generated if not specified).
  pull?: boolean; // Flag to force pull the bundle (if it's already cached.)
  silent?: boolean;
  timeout?: number; // Msecs.
  in?: Partial<t.RuntimeIn>;
};

export type IResPostFunc = {
  ok: boolean;
  elapsed: number; // total milliseconds.
  results: t.IResPostFuncResult[];
  runtime: { name: t.RuntimeEnv['name']; version: string };
};

export type IResPostFuncResult = {
  ok: boolean;
  tx: string; // Execution transaction ID.
  out: t.RuntimeOut;
  elapsed: t.RuntimeElapsed;
  bundle: t.RuntimeBundleOrigin;
  entry: string;
  cache: { exists: boolean; pulled: boolean };
  size: { bytes: number; files: number };
  silent: boolean;
  errors: t.IRuntimeError[];
};
