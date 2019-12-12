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
 * URL query-string parameters for a [Cell].
 */
export type IUrlQueryCell = {};
