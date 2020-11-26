import { t } from '../common';

type O = Record<string, unknown>;

/**
 * POST: Execute Function(s).
 */
export type IReqQueryFunc = O; // 🐷 Placeholder type.

export type IReqPostFuncBody = t.IReqPostFuncBundle | t.IReqPostFuncBundle[];

export type IReqPostFuncBundle = {
  uri: string; // Cell URI
  host?: string; // NB: the running system's host is used if not specified.
  dir?: string;
  params?: t.JsonMap;
  pull?: boolean; // Flag to force pull the bundle (if it's already cached.)
  silent?: boolean;
};

export type IResPostFunc = {
  elapsed: number;
  results: t.IResPostFuncBundle[];
};

export type IResPostFuncBundle = {
  ok: boolean;
  elapsed: number;
  bundle: t.RuntimeBundleOrigin;
  cache: { exists: boolean; pulled: boolean };
  runtime: { name: t.RuntimeEnv['name'] };
  size: { bytes: number; files: number };
  urls: { files: string; manifest: string };
  errors: t.IRuntimeError[];
};
