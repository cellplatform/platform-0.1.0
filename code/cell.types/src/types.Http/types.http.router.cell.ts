import { t } from '../common';

export type IUrlParamsCoord = t.IUrlParamsCell | t.IUrlParamsRow | t.IUrlParamsColumn;

export type IResGetCoord = IResGetCell | IResGetRow | IResGetColumn;

/**
 * GET: Cell
 */
export type IUrlParamsCell = { ns: string; key: string };
export type IReqQueryCellInfo = {};

export type IResGetCell = t.IUriResponse<IResGetCellData, IResGetCellUrls>;
export type IResGetCellData = t.ICellData;
export type IResGetCellUrls = { cell: string; files: string };

/**
 * GET: Row
 */
export type IUrlParamsRow = { ns: string; key: string };
export type IReqQueryRowInfo = {};

export type IResGetRow = t.IUriResponse<IResGetRowData, IResGetRowUrls>;
export type IResGetRowData = t.IRowData;
export type IResGetRowUrls = {};

/**
 * GET: Column
 */
export type IUrlParamsColumn = { ns: string; key: string };
export type IReqQueryColumnInfo = {};

export type IResGetColumn = t.IUriResponse<IResGetColumnData, IResGetColumnUrls>;
export type IResGetColumnData = t.IColumnData;
export type IResGetColumnUrls = {};
