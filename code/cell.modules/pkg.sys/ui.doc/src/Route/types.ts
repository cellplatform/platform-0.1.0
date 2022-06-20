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
};

/**
 * Abstract mapping of the W3C [window.location] object.
 * Useful for mocking, of running a "sub-module" that thinks in URLs
 * loaded within a parent module but within the same "page" context.
 */
export type RouteLocation = {
  readonly href: string;
  readonly origin: string;
  readonly host: string;
  readonly hostname: string;
  readonly port: string;
  readonly protocol: string;
  readonly search: string;
  pathname: string;
  hash: string;
  searchParams: {
    keys: string[];
    get(key: string): string | null;
    set(key: string, value: string): void;
    delete(key: string): void;
  };
  toString(): string;
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
};

/**
 * EVENT (DEFINITIONS)
 */
export type RouteEvent = RouteInfoReqEvent | RouteInfoResEvent;

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
