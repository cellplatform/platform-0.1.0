import * as t from '../common/types';

export type RouteInstance = { bus: t.EventBus<any>; id?: Id };

type Id = string;
type Milliseconds = number;

export type RouteInfo = {
  url: RouteInfoUrl;
  localhost: boolean;
  secure: boolean; // TLS ("https:")
};

export type RouteInfoUrl = {
  href: string;
  path: string;
  query: RouteQuery;
  hash: string;
};

export type RouteQuery = { [key: string]: string };
export type RouteQueryKeyValue = { key: string; value: string };

export type RouteQueryParams = {
  readonly url: URL;
  readonly keys: string[];
  get(key: string): string | null;
  set(key: string, value: string): void;
  delete(key: string): void;
  clear(): void;
  toObject(): RouteQuery;
  toString(): string;
};

/**
 * EVENT (API)
 */
export type RouteEventsDisposable = RouteEvents & t.Disposable & { clone(): RouteEvents };
export type RouteEvents = {
  $: t.Observable<t.RouteEvent>;
  instance: { bus: Id; id: Id };
  is: { base(input: any): boolean };
  ready(): Promise<RouteEvents>;
  info: {
    req$: t.Observable<t.RouteInfoReq>;
    res$: t.Observable<t.RouteInfoRes>;
    get(options?: { timeout?: Milliseconds }): Promise<RouteInfoRes>;
  };
  current: {
    $: t.Observable<t.RouteCurrent>;
    url: RouteInfoUrl;
    refresh(): Promise<void>;
  };
  change: {
    req$: t.Observable<t.RouteChangeReq>;
    res$: t.Observable<t.RouteChangeRes>;
    fire(options: {
      path?: string;
      hash?: string;
      query?: RouteQuery | RouteQueryKeyValue[];
      timeout?: Milliseconds;
    }): Promise<RouteChangeRes>;
    path(value: string, options?: { timeout?: Milliseconds }): Promise<RouteChangeRes>;
    hash(value: string, options?: { timeout?: Milliseconds }): Promise<RouteChangeRes>;
    query(
      value: RouteQuery | RouteQueryKeyValue[],
      options?: { timeout?: Milliseconds },
    ): Promise<RouteChangeRes>;
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
  | RouteCurrentEvent
  | RouteRefreshEvent;

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
  query?: RouteQuery | RouteQueryKeyValue[];
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
export type RouteCurrentEvent = {
  type: 'sys.ui.route/current';
  payload: RouteCurrent;
};
export type RouteCurrent = {
  instance: Id;
  info: RouteInfo;
};

/**
 * Refresh
 * (Alert listeners to current state (via forcing the "current" method to fire)
 */
export type RouteRefreshEvent = {
  type: 'sys.ui.route/refresh';
  payload: RouteRefresh;
};
export type RouteRefresh = { instance: Id };
