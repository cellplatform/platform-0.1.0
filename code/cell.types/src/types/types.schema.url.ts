export type IUrl<Q extends object = {}> = {
  readonly origin: string;
  readonly path: string;
  readonly querystring: string;
  query(input: Partial<Q>): IUrl<Q>;
  toString(options?: { origin?: boolean }): string;
};

/**
 * ------------------------------------------------------------------
 * NAMESPACE
 * ------------------------------------------------------------------
 */
export type IUrlParamsNs = { ns: string };

/**
 * Query-string parameters for a [Namespace].
 */
export type IUrlQueryGetNs = {
  data?: boolean; // true: all (cells/rows/columns) - overrides other fields.
  cells?: boolean | string | Array<string | boolean>; // true: all | string: key or range, eg "A1", "A1:C10"
  columns?: boolean | string | Array<string | boolean>;
  rows?: boolean | string | Array<string | boolean>;
};

export type IUrlQueryPostNs = IUrlQueryGetNs & {
  changes?: boolean; // NB: return list of changes (default: true).
};

/**
 * ------------------------------------------------------------------
 * COORD (General coordinates for: CELL | ROW | COLUMN)
 * ------------------------------------------------------------------
 */
export type IUrlParamsCoord = IUrlParamsCell | IUrlParamsRow | IUrlParamsColumn;

/**
 * ------------------------------------------------------------------
 * CELL
 * ------------------------------------------------------------------
 */
export type IUrlParamsCell = { ns: string; key: string };

export type IUrlParamsCellFiles = IUrlParamsCell;
export type IUrlParamsCellFileByName = IUrlParamsCell & { filename: string };
export type IUrlParamsCellFileByIndex = IUrlParamsCell & { index: number };

/**
 * Query-string parameters for a [Cell].
 */
export type IUrlQueryGetCell = {};

/**
 * Query-string parameters for a [Cell]'s files.
 */
export type IUrlQueryGetCellFiles = {};

/**
 * Query-string parameters for a single [Cell]'s file (by name).
 */
export type IUrlQueryGetCellFile = IUrlQueryGetFile & {};
export type IUrlQueryGetCellFileByName = IUrlQueryGetCellFile;
export type IUrlQueryGetCellFileByIndex = IUrlQueryGetCellFile;

/**
 * ------------------------------------------------------------------
 * ROW
 * ------------------------------------------------------------------
 */
export type IUrlParamsRow = { ns: string; key: string };

/**
 * Query-string parameters for a cell [Row].
 */
export type IUrlQueryGetRow = {};

/**
 * ------------------------------------------------------------------
 * COLUMN
 * ------------------------------------------------------------------
 */
export type IUrlParamsColumn = { ns: string; key: string };

/**
 * Query-string parameters for a cell [Column].
 */
export type IUrlQueryGetColumn = {};

/**
 * ------------------------------------------------------------------
 * FILE
 * ------------------------------------------------------------------
 */
export type IUrlParamsFile = { ns: string; file: string };

/**
 * Query-string parameters for a [File].
 */
export type IUrlQueryGetFile = { hash?: string };
export type IUrlQueryGetFileInfo = {};

export type IUrlQueryPostFile = {
  changes?: boolean; // NB: return list of changes (default: true).
};
