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
  host: string;
  uri: string;
};
