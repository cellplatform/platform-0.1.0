import { t } from '../common';

type SemVer = string;

/**
 * POST: Execute Function(s).
 */
export type IReqQueryFunc = {
  pull?: boolean; //          Sets default "pull" flag when not specified within individual body payload.
  silent?: boolean; //        Sets default "silent" flag when not specified within individual body payload.
  timeout?: number; //        Sets default "timeout" (msecs) when not specified within individual body payload.
  onError?: OnFuncError; //   Sets default "onError" behavior when not specified within individual body payload.
  json?: boolean; //          Force the response to "application/json" even if executing function sets different [contentType] response.
};

export type IReqPostFuncBody = IReqPostFuncSerial | IReqPostFuncParallel;
export type IReqPostFuncSerial = t.IReqPostFunc[]; // Piped list of functions.
export type IReqPostFuncParallel = { [key: string]: t.IReqPostFunc }; // Paralell execution (arbitrary key value).

export type IReqPostFunc = {
  bundle: t.ManifestUrl; //     Address of the code-module's bundle manifest to execute.
  entry?: string; //            Entry path within bundle (if not specified default manifest entry is used).
  fileshash?: string; //        The hash of the bundle's files to match before executing (throws error on mismatch).
  tx?: string; //               Execution transaction ID (generated if not specified).
  pull?: boolean; //            Force pull the bundle (if it's already cached) - default:false
  silent?: boolean; //          Supress console output - default:true
  timeout?: t.Timeout; //       Max time (msecs) the function may run for.
  in?: Partial<t.RuntimeIn>; // Function input args (merged with piped output when running list).
  onError?: OnFuncError; //     Pipeline behavior when an error is thrown. Default: "stop".
};

export type OnFuncError = 'stop' | 'continue';

export type IResPostFunc = {
  ok: boolean;
  elapsed: number; // total milliseconds.
  execution: 'serial' | 'parallel';
  runtime: { name: t.RuntimeEnv['name']; version: SemVer };
  results: t.IResPostFuncResult[];
};

export type IResPostFuncResult = {
  ok: boolean;
  tx: string; // Execution transaction ID.
  out: t.RuntimeOut;
  elapsed: t.RuntimeElapsed;
  bundle: { url: t.ManifestUrl; fileshash: string; version: SemVer };
  entry: string;
  cache: { exists: boolean; pulled: boolean };
  size: { bytes: number; files: number };
  silent: boolean;
  errors: t.IRuntimeError[];
};
