import { Observable } from 'rxjs';

export type RefTarget = 'VALUE' | 'FUNC' | 'RANGE' | 'UNKNOWN';
export type RefDirection = 'IN' | 'OUT';

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
  events$: Observable<RefsTableEvent>;
  refs(args?: { range?: string | string[]; force?: boolean }): Promise<IRefs>;
  outgoing(args?: { range?: string | string[]; force?: boolean }): Promise<IRefsOut>;
  incoming(args?: {
    range?: string | string[];
    force?: boolean;
    outRefs?: IRefsOut;
  }): Promise<IRefsIn>;
  reset(args?: { cache?: RefDirection[] }): IRefsTable;
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
export type IRefIn = { cell: string };

/**
 * Error
 */
export type RefError = 'CIRCULAR' | 'NAME';
export type IRefError = {
  type: RefError;
  message: string;
};

/**
 * [Events]
 */
export type RefsTableEvent = IRefsTableGetKeysEvent | IRefsTableGetValueEvent;

export type IRefsTableGetKeysEvent = {
  type: 'REFS/table/getKeys';
  payload: IRefsTableGetKeys;
};
export type IRefsTableGetKeys = {
  keys: string[];
  isModified: boolean;
  modify(keys: string[]): void;
};

export type IRefsTableGetValueEvent = {
  type: 'REFS/table/getValue';
  payload: IRefsTableGetValue;
};
export type IRefsTableGetValue = {
  key: string;
  value?: string;
  isModified: boolean;
  modify(value?: string): void;
};
