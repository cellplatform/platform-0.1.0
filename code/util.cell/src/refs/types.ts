export type RefTarget = 'VALUE' | 'FUNC' | 'RANGE' | 'UNKNOWN';

/**
 * Retrieve data for calculating refs.
 */
export type IRefContext = {
  getValue: (key: string) => Promise<string | undefined>;
};

/**
 * Table references.
 */
export type IRefs = {
  out: IRefsOut;
  in: IRefsIn;
};

/**
 * Outgoing
 */
export type IRefsOut = { [key: string]: IRefOut };
export type IRefOut = {
  // source: 'CELL' |  'RANGE' | 'FUNC';
  target: RefTarget;
  path: string;
  param?: number;
  error?: IRefError;
};

/**
 * Incoming
 */
export type IRefsIn = { [key: string]: IRefIn };
export type IRefIn = {};

/**
 * Error
 */
export type RefError = 'CIRCULAR' | 'NAME';
export type IRefError = {
  type: RefError;
  message: string;
};
