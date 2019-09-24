/**
 * Retrieve data for calculating refs.
 */
export type IRefContext = {
  getValue: (key: string) => Promise<string | undefined>;
};

/**
 * References
 */
export type RefTarget = 'VALUE' | 'FUNC' | 'RANGE' | 'UNKNOWN';

export type ICellRefs = {
  out: IRefOut[];
};

export type IRefOut = {
  // source: 'CELL' |  'RANGE' | 'FUNC';
  target: RefTarget;
  path: string;
  param?: number;
  error?: IRefError;
};

/**
 * Error
 */
export type RefError = 'CIRCULAR' | 'NAME';
export type IRefError = {
  type: RefError;
  message: string;
};
