import * as t from '../common/types';

export type RouteInstance = { bus: t.EventBus<any>; id?: Id };

type Id = string;
type Milliseconds = number;

export type RouteInfo = {
  url: RouteInfoUrl;
  localhost: boolean;
  secure: boolean; // https (TLS)
};

export type RouteInfoUrl = {
  href: string;
  path: string;
  query: RouteQuery;
  hash: string;
};

export type RouteQuery = { [key: string]: string };
export type RouteQueryKeyPair = { key: string; value: string };

/**
 * Abstract mapping of the W3C [window.location] object.
 * Useful for mocking, of running a "sub-module" that thinks in URLs
 * loaded within a parent module but within the same "page" context.
 */
export type RouteLocation = {
  href: string;
  readonly origin: string;
  readonly host: string;
  readonly hostname: string;
  readonly port: string;
  readonly protocol: string;
  readonly search: string;
  pathname: string;
  hash: string;
  searchParams: RouteLocationSearchParams;
  toString(): string;
};

export type RouteLocationSearchParams = {
  keys: string[];
  get(key: string): string | null;
  set(key: string, value: string): void;
  delete(key: string): void;
  toObject(): RouteQuery;
};

/**
 * EVENT (API)
 */
export type RouteEvents = t.Disposable & {
  $: t.Observable<t.RouteEvent>;
  instance: { bus: Id; id: Id };
  is: { base(input: any): boolean };
  info: {
    req$: t.Observable<t.RouteInfoReq>;
    res$: t.Observable<t.RouteInfoRes>;
    get(options?: { timeout?: Milliseconds }): Promise<RouteInfoRes>;
  };
  changed$: t.Observable<t.RouteChanged>;
  change: {
    req$: t.Observable<t.RouteChangeReq>;
    res$: t.Observable<t.RouteChangeRes>;
    fire(options: {
      path?: string;
      hash?: string;
      query?: RouteQuery | RouteQueryKeyPair[];
      timeout?: Milliseconds;
    }): Promise<RouteChangeRes>;
  };
};

/**
 * EVENT (DEFINITIONS)
 */
export type RouteEvent =
  | RouteInfoReqEvent
  | RouteInfoResEvent
  | RouteChangeReqEvent
  | RouteChangeResEvent
  | RouteChangedEvent;

/**
 * Module info.
 */
export type RouteInfoReqEvent = {
  type: 'sys.ui.route/info:req';
  payload: RouteInfoReq;
};
export type RouteInfoReq = { tx: string; instance: Id };

export type RouteInfoResEvent = {
  type: 'sys.ui.route/info:res';
  payload: RouteInfoRes;
};
export type RouteInfoRes = {
  tx: string;
  instance: Id;
  info?: RouteInfo;
  error?: string;
};

/**
 * Change
 */
export type RouteChangeReqEvent = {
  type: 'sys.ui.route/change:req';
  payload: RouteChangeReq;
};
export type RouteChangeReq = {
  tx: string;
  instance: Id;
  path?: string;
  hash?: string;
  query?: RouteQuery | RouteQueryKeyPair[];
};

export type RouteChangeResEvent = {
  type: 'sys.ui.route/change:res';
  payload: RouteChangeRes;
};
export type RouteChangeRes = {
  tx: string;
  instance: Id;
  info?: RouteInfo;
  error?: string;
};

/**
 * Changed
 */
export type RouteChangedEvent = {
  type: 'sys.ui.route/changed';
  payload: RouteChanged;
};
export type RouteChanged = {
  instance: Id;
  info: RouteInfo;
};
