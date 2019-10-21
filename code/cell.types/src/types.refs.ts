import { Observable } from 'rxjs';
import { t } from './common';

export type RefTarget = 'VALUE' | 'FUNC' | 'REF' | 'RANGE' | 'UNKNOWN';
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

export type IRefsUpdateArgs = { key: string; from?: string; to?: string };
export type RefsTableUpdate = {
  ok: boolean;
  changed: IRefsUpdateArgs[];
  keys: string[];
  refs: IRefs;
  errors: t.IRefError[];
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
  update(args: IRefsUpdateArgs | IRefsUpdateArgs[]): Promise<RefsTableUpdate>;
};

/**
 * Outgoing
 */
export type IRefsOut = { [key: string]: IRefOut[] };
export type IRefOut = {
  target: RefTarget;
  path: string;
  param?: string;
  error?: t.IRefError;
};

/**
 * Incoming
 */
export type IRefsIn = { [key: string]: IRefIn[] };
export type IRefIn = { cell: string };

/**
 * [Events]
 */
export type RefsTableEvent =
  | IRefsTableGetKeysEvent
  | IRefsTableGetValueEvent
  | IRefsTableUpdateEvent;

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

export type IRefsTableUpdateEvent = {
  type: 'REFS/table/update';
  payload: RefsTableUpdate;
};
