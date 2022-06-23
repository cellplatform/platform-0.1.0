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
  size: { width: number; height: number };
  render: RouteTableRenderHandler;
};

/**
 * Render Handler
 */
export type RouteTableRenderHandler = (args: RouteTableRenderHandlerArgs) => void;
export type RouteTableRenderHandlerArgs = JSX.Element;

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
};
export type RouteParams = { [key: string]: string };
