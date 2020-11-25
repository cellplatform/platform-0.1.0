import { t } from '../common';

type O = Record<string, unknown>;

/**
 * POST: Cell/func
 */
export type IReqQueryFunc = O; // 🐷 Placeholder type.

export type IReqPostFuncBody = {
  uri: string; // cell uri
  host?: string;
  dir?: string;
  params?: t.JsonMap;
  pull?: boolean; // Flag to force pull the bundle (if it's already cached.)
  silent?: boolean;
};

export type IResPostFunc = {
  elapsed: number;
  cache: { exists: boolean; pulled: boolean };
  runtime: { name: t.RuntimeEnv['name'] };
  size: { bytes: number; files: number };
  errors: t.IRuntimeError[];
  urls: { files: string; manifest: string };
};
