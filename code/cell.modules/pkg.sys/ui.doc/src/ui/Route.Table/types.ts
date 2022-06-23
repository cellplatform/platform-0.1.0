import * as t from '../../common/types';

export type RouteTableDefs = {
  [pattern: string]: RouteTableHandler;
};

/**
 * Handler
 */
export type RouteTableHandler = (e: RouteTableHandlerArgs) => any;
export type RouteTableHandlerArgs = {
  url: t.RouteUrl;
  route: string;
  render: RouteRenderHandler;
};

/**
 * Render Handler
 */
export type RouteRenderHandler = (args: RouteRenderHandlerArgs) => void;
export type RouteRenderHandlerArgs = JSX.Element; // TODO - async (promise) response, for spinner

/**
 * Route table.
 */
export type RouteTable = {
  readonly kind: 'RouteTable';
  readonly routes: RouteTablePath[];
  declare(defs: t.RouteTableDefs): RouteTable;
  match<P extends RouteParams>(path: string): RouteMatch<P> | undefined;
};

export type RouteTablePath = {
  pattern: string;
  handler: RouteTableHandler;
};

export type RouteMatch<P extends RouteParams> = {
  path: string;
  pattern: string;
  index: number;
  params: P;
  handler: RouteTableHandler;
};
export type RouteParams = { [key: string]: string };
