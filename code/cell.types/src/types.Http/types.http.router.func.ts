import { t } from '../common';

type O = Record<string, unknown>;

/**
 * POST: Execute Function(s).
 */
export type IReqQueryFuncRun = O; // 🐷 Placeholder type.

/**
 * TODO 🐷 - Func Query String
 * - pull: boolean    - global "pull" param if undefined on Body.
 * - silent: boolean  - global "silent" param if undefined on Body.
 */

export type IReqPostFuncRunBody = t.IReqPostFuncRun | t.IReqPostFuncRun[];

export type IReqPostFuncRun = {
  uri: string; // Cell URI
  host?: string; // NB: the running system's host is used if not specified.
  dir?: string;
  params?: t.JsonMap;
  pull?: boolean; // Flag to force pull the bundle (if it's already cached.)
  silent?: boolean;
};

export type IResPostFuncRun = {
  elapsed: number;
  results: t.IResPostFuncRunResult[];
};

export type IResPostFuncRunResult = {
  ok: boolean;
  elapsed: number;
  bundle: t.RuntimeBundleOrigin;
  cache: { exists: boolean; pulled: boolean };
  runtime: { name: t.RuntimeEnv['name'] };
  size: { bytes: number; files: number };
  urls: { files: string; manifest: string };
  errors: t.IRuntimeError[];
};
