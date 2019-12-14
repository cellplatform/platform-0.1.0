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

/**
 * URL query-string parameters for a [Namespace].
 */
export type IUrlQueryNs = {
  data?: boolean; // true: all (cells/rows/columns) - overrides other fields.
  cells?: boolean | string | Array<string | boolean>; // true: all | string: key or range, eg "A1", "A1:C10"
  columns?: boolean | string | Array<string | boolean>;
  rows?: boolean | string | Array<string | boolean>;
};

/**
 * CELL
 */

/**
 * URL query-string parameters for a [Cell].
 */
export type IUrlQueryCell = {};

/**
 * URL query-string parameters for a [Cell]'s files.
 */
export type IUrlQueryCellFiles = {};

/**
 * URL query-string parameters for a single [Cell]'s file (by name).
 */
export type IUrlQueryCellFile = {};

/**
 * ROW
 */

/**
 * URL query-string parameters for a cell [Row].
 */
export type IUrlQueryRow = {};

/**
 * COLUMN
 */

/**
 * URL query-string parameters for a cell [Column].
 */
export type IUrlQueryColumn = {};

/**
 * FILE
 */

/**
 * URL query-string parameters for a [File].
 */
export type IUrlQueryGetFile = {};
export type IUrlQueryPostFile = {
  changes?: boolean; // NB: return list of changes (default: true).
};
export type IUrlQueryGetFileInfo = {};
