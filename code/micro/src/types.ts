import * as t from './common/types';

type O = Record<string, unknown>;

/**
 * Server
 */
export type MicroLogProps = { [key: string]: string | number | boolean | undefined };

export type MicroStart = (options?: {
  port?: number | string; // NB: string allows for Docker style mappings <external> => <internal>. Where <internal> is used.
  log?: MicroLogProps;
  silent?: boolean;
}) => Promise<MicroService>;

export type Micro = {
  server: t.Server;
  router: t.IRouter;
  handler: t.RouteHandler;
  service?: MicroService;
  events$: t.Observable<MicroEvent>;
  request$: t.Observable<MicroRequest>;
  response$: t.Observable<MicroResponse>;
  start: MicroStart;
  stop(): Promise<void>;
};

export type MicroService = {
  port: number;
  isRunning: boolean;
  events$: t.Observable<MicroEvent>;
  request$: t.Observable<MicroRequest>;
  response$: t.Observable<MicroResponse>;
  stop(): Promise<void>;
};

/**
 * [Events]
 */

export type MicroEvent =
  | MicroStartedEvent
  | MicroStoppedEvent
  | MicroRequestEvent
  | MicroResponseEvent;

export type MicroStartedEvent = {
  type: 'SERVICE/started';
  payload: MicroStarted;
};
export type MicroStarted = { elapsed: t.IDuration; port: number };

export type MicroStoppedEvent = {
  type: 'SERVICE/stopped';
  payload: MicroStopped;
};
export type MicroStopped = { elapsed: t.IDuration; port: number; error?: string };

export type MicroRequestEvent = {
  type: 'SERVICE/request';
  payload: MicroRequest;
};
export type MicroRequest = {
  method: t.HttpMethod;
  url: string;
  req: t.IncomingMessage;
  error?: string;
  isModified: boolean;
  modify(input: MicroRequestModify | (() => Promise<MicroRequestModify>)): void;
};
export type MicroRequestModify<C extends O = O> = { context?: C };

export type MicroResponseEvent = {
  type: 'SERVICE/response';
  payload: MicroResponse;
};
export type MicroResponse<C extends O = O> = {
  elapsed: t.IDuration;
  method: t.HttpMethod;
  url: string;
  req: t.IncomingMessage;
  res: t.IRouteResponse;
  error?: string;
  isModified: boolean;
  context: C;
  modify(input: t.IRouteResponse | (() => Promise<t.IRouteResponse>)): void;
};
