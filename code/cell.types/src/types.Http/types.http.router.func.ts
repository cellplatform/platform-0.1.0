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
};

export type IResPostFunc = {
  elapsed: number;
  runtime: { name: t.RuntimeEnv['name'] };
  size: { bytes: number; files: number };
  errors: t.IRuntimeError[];
  urls: { files: string; manifest: string };
};
