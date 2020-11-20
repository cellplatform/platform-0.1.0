import { t } from '../common';

type O = Record<string, unknown>;

/**
 * POST: Cell/func
 */
export type IReqQueryCellFunc = O; // 🐷 Placeholder type.

export type IReqPostCellFuncBody = {
  host?: string;
  uri: string; // cell uri
  dir: string;
  params: t.JsonMap;
};

export type IResPostCellFunc = {
  host: string;
  uri: string;
};
