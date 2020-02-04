export type IUrl<Q extends object = {}> = {
  readonly origin: string;
  readonly path: string;
  readonly querystring: string;
  query(input: Partial<Q>): IUrl<Q>;
  toString(options?: { origin?: boolean }): string;
};

/**
 * ------------------------------------------------------------------
 * LOCAL (local device stand-in for external/cloud systems)
 * ------------------------------------------------------------------
 */
export type IUrlQueryLocalFs = {};

/**
 * ------------------------------------------------------------------
 * NAMESPACE
 * ------------------------------------------------------------------
 */
export type IUrlParamsNs = { ns: string };

/**
 * Query-string parameters for a [Namespace].
 */
export type IUrlQueryNsInfo = {
  data?: boolean; // true: all (cells/rows/columns) - overrides other fields.
  cells?: boolean | string | Array<string | boolean>; // true: all | string: key or range, eg "A1", "A1:C10"
  columns?: boolean | string | Array<string | boolean>;
  rows?: boolean | string | Array<string | boolean>;
  files?: boolean;
};

export type IUrlQueryNsWrite = IUrlQueryNsInfo & {
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
export type IUrlParamsCellFileByFileUri = IUrlParamsCell & { filename: string };

/**
 * Query-string parameters for a [Cell].
 */
export type IUrlQueryCellInfo = {};

/**
 * Query-string parameters for a [Cell]'s files.
 */
export type IUrlQueryCellFilesList = {
  expires?: string; //  Links expire. Parsable duration, eg "1h", "5m" etc. Max: "1h".
  files?: boolean; //   Show files (default: true).
  urls?: boolean; //    Show URLs (default: true).
};
export type IUrlQueryCellFilesUpload = {
  changes?: boolean; // NB: return list of changes (default: true).
};
export type IUrlQueryCellFilesUploaded = {
  changes?: boolean; // NB: return list of changes (default: true).
};
export type IUrlQueryCellFilesDelete = {};

/**
 * Query-string parameters for a single [Cell]'s file (by name).
 */
export type IUrlQueryCellFileInfo = IUrlQueryFileInfo & {};
export type IUrlQueryCellFileDownloadByName = IUrlQueryCellFileInfo & {
  hash?: string;
  expires?: string; // Parsable duration, eg "1h", "5m" etc. Max: "1h".
};
export type IUrlQueryCellFileDownloadByFileUri = IUrlQueryCellFileDownloadByName;

/**
 * ------------------------------------------------------------------
 * ROW
 * ------------------------------------------------------------------
 */
export type IUrlParamsRow = { ns: string; key: string };

/**
 * Query-string parameters for a cell [Row].
 */
export type IUrlQueryRowInfo = {};

/**
 * ------------------------------------------------------------------
 * COLUMN
 * ------------------------------------------------------------------
 */
export type IUrlParamsColumn = { ns: string; key: string };

/**
 * Query-string parameters for a cell [Column].
 */
export type IUrlQueryColumnInfo = {};

/**
 * ------------------------------------------------------------------
 * FILE
 * ------------------------------------------------------------------
 */
export type IUrlParamsFile = { ns: string; file: string };

/**
 * Query-string parameters for a [File].
 */
export type IUrlQueryFileInfo = {};
export type IUrlQueryFileDownload = { hash?: string };

export type IUrlQueryFileDelete = {
  changes?: boolean; // NB: return list of changes (default: true).
};
export type IUrlQueryFileUploadComplete = {
  changes?: boolean; // NB: return list of changes (default: true).
};

/**
 * ------------------------------------------------------------------
 * SYS
 * ------------------------------------------------------------------
 */
export type IUrlSysUidQuery = { total?: number };
