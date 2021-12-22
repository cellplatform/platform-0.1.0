import * as t from '../common/types';

type O = Record<string, unknown>;
type DocumentId = string;
type InstanceId = string;
type Milliseconds = number;

/**
 * Event API.
 */
export type CrdtEvents = t.Disposable & {
  $: t.Observable<t.CrdtEvent>;
  id: InstanceId;
  is: { base(input: any): boolean };

  info: {
    req$: t.Observable<t.CrdtInfoReq>;
    res$: t.Observable<t.CrdtInfoRes>;
    get(options?: { timeout?: Milliseconds }): Promise<t.CrdtInfoRes>;
  };

  state: {
    req$: t.Observable<t.CrdtRefReq>;
    res$: t.Observable<t.CrdtRefRes>;
    changed$: t.Observable<t.CrdtRefChanged>;
    fire<T extends O>(args: {
      doc: DocumentId;
      initial: T | (() => T);
      change?: t.CrdtChangeHandler<T>;
      timeout?: Milliseconds;
    }): Promise<t.CrdtRefRes<T>>;
    exists: {
      req$: t.Observable<t.CrdtRefExistsReq>;
      res$: t.Observable<t.CrdtRefExistsRes>;
      fire(doc: DocumentId, options?: { timeout?: Milliseconds }): Promise<t.CrdtRefExistsRes>;
    };
    remove: {
      $: t.Observable<t.CrdtRefRemove>;
      fire(doc: DocumentId): Promise<void>;
    };
  };

  doc<T extends O>(args: CrdtDocEventsArgs<T>): Promise<CrdtDocEvents<T>>;
};

/**
 * Event API: Single document.
 */
export type CrdtDocEvents<T extends O> = {
  id: DocumentId;
  current: T;
  changed$: t.Observable<t.CrdtRefChanged<O>>;
  change(handler: t.CrdtChangeHandler<T>): Promise<T>;
};

export type CrdtDocEventsArgs<T> = { id: DocumentId; initial: T | (() => T) };
