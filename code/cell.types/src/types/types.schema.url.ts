export type IUrl<Q extends object = {}> = {
  readonly origin: string;
  readonly path: string;
  readonly querystring: string;
  query(input: Partial<Q>): IUrl<Q>;
  toString(options?: { origin?: boolean }): string;
};

/**
 * NAMESPACE
 */

export type IUrlParamsNs = { ns: string };

/**
 * URL query-string parameters for a [Namespace].
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
 * CELL
 */

/**
 * URL query-string parameters for a [Cell].
 */
export type IUrlQueryGetCell = {};

/**
 * URL query-string parameters for a [Cell]'s files.
 */
export type IUrlQueryGetCellFiles = {};

/**
 * URL query-string parameters for a single [Cell]'s file (by name).
 */
export type IUrlQueryGetCellFile = IUrlQueryGetFile & {};
export type IUrlQueryGetCellFileByName = IUrlQueryGetCellFile;
export type IUrlQueryGetCellFileByIndex = IUrlQueryGetCellFile;

/**
 * ROW
 */

/**
 * URL query-string parameters for a cell [Row].
 */
export type IUrlQueryGetRow = {};

/**
 * COLUMN
 */

/**
 * URL query-string parameters for a cell [Column].
 */
export type IUrlQueryGetColumn = {};

/**
 * FILE
 */

/**
 * URL query-string parameters for a [File].
 */
export type IUrlQueryGetFile = { hash?: string };
export type IUrlQueryGetFileInfo = {};

export type IUrlQueryPostFile = {
  changes?: boolean; // NB: return list of changes (default: true).
};
