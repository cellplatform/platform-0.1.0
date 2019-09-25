export type RefTarget = 'VALUE' | 'FUNC' | 'RANGE' | 'UNKNOWN';

/**
 * Retrieve data for calculating refs.
 */
export type RefGetValue = (key: string) => Promise<string | undefined>;
export type RefGetKeys = () => Promise<string[]>;

/**
 * References.
 */
export type IRefs = {
  in: IRefsIn;
  out: IRefsOut;
};

/**
 * Table
 */
export type IRefsTable = {
  outgoing(args?: { range?: string; force?: boolean }): Promise<IRefsOut>;
  reset(): IRefsTable;
};

/**
 * Outgoing
 */
export type IRefsOut = { [key: string]: IRefOut[] };
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
export type IRefsIn = { [key: string]: IRefIn[] };
export type IRefIn = { path: string };

/**
 * Error
 */
export type RefError = 'CIRCULAR' | 'NAME';
export type IRefError = {
  type: RefError;
  message: string;
};
