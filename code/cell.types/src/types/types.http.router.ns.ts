import { t } from '../common';

/**
 * GET: Namespace
 */
export type IUrlParamsNs = { ns: string };
export type IReqQueryNsInfo = {
  data?: boolean; // true: all (cells|rows|columns) - overrides other fields.
  cells?: boolean | string | (string | boolean)[]; // true: all | string: key or range, eg "A1", "A1:C10"
  columns?: boolean | string | (string | boolean)[];
  rows?: boolean | string | (string | boolean)[];
  files?: boolean;
  total?: boolean | t.NsTotalKey | t.NsTotalKey[];
};

export type IResGetNs = t.IUriResponse<IResGetNsData, IResGetNsUrls>;
export type IResGetNsData = Partial<t.INsDataChildren> & {
  ns: t.INs;
  total?: Partial<t.INsTotals>;
};
export type IResGetNsUrls = { data: string };

/**
 * GET: Types (typesystem)
 */
export type IReqQueryNsTypes = {
  typename?: string | string[] | boolean;
};

export type IResGetNsTypes = {
  uri: string;
  types: { typename: string; columns: t.IColumnTypeDef[] }[];
  typescript: string;
};

/**
 * POST: Namespace (write)
 */
export type IReqQueryNsWrite = t.IReqQueryNsInfo & {
  changes?: boolean; // NB: return list of changes (default: true).
};

export type IReqPostNsBody = {
  ns?: Partial<t.INsProps>;
  cells?: t.ICellMap<any>;
  columns?: t.IColumnMap<any>;
  rows?: t.IRowMap<any>;
  calc?: boolean | string | (string | boolean)[]; // Perform calcuations (default: false), if string key/range of cells to calculate, eg "A1", "A1:C10"
};
export type IResPostNs = IResGetNs & { changes?: t.IDbModelChange[] };
