import { t } from '../common';

/**
 * POST: Execute Function(s).
 */
export type IReqQueryFunc = {
  pull?: boolean; //        Sets default "pull" flag when not specified within individual body payload.
  silent?: boolean; //      Sets default "silent" flag when not specified within individual body payload.
  timeout?: number; //      Sets default "timeout" (msecs) when not specified within individual body payload.
  onError?: OnFuncError; // Sets default "onError" behavior when not specified within individual body payload.
  json?: boolean; //        Force the response to "application/json" even if executing function sets different [contentType] response.
};

export type IReqPostFuncBody = IReqPostFuncSerial | IReqPostFuncParallel;
export type IReqPostFuncSerial = t.IReqPostFunc[]; // Piped list of functions.
export type IReqPostFuncParallel = { [key: string]: t.IReqPostFunc }; // Paralell execution (arbitrary key value).

export type IReqPostFunc = {
  uri: string; //               Cell URI containing bundle.
  host?: string; //             Host domain. The running system's host is used if not specified.
  dir?: string; //              Directory of the cell.
  entry?: string; //            Entry path within bundle (if not specified default manfest entry is used).
  hash?: string; //             The hash of the bundle to match before executing (throws error on mismatch).
  tx?: string; //               Execution transaction ID (generated if not specified).
  pull?: boolean; //            Force pull the bundle (if it's already cached) - default:false
  silent?: boolean; //          Supress console output - default:true
  timeout?: t.Timeout; //          Max time (msecs) the function may run for.
  in?: Partial<t.RuntimeIn>; // Function input args (merged with piped output when running list).
  onError?: OnFuncError; //     Pipeline behavior when an error is thrown. Default: "stop".
};

export type OnFuncError = 'stop' | 'continue';

export type IResPostFunc = {
  ok: boolean;
  elapsed: number; // total milliseconds.
  execution: 'serial' | 'parallel';
  runtime: { name: t.RuntimeEnv['name']; version: string };
  results: t.IResPostFuncResult[];
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
