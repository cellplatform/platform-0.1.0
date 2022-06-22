import * as t from '../../common/types';

export type RouteTable = {
  [pattern: string]: RouteTableHandler;
};

export type RouteTableHandler = (e: RouteTableHandlerArgs) => any;
export type RouteTableHandlerArgs = {
  url: t.RouteUrl;
  route: { pattern: string; match: string };
  size: { width: number; height: number };
  render: RouteTableRenderHandler;
};

export type RouteTableRenderHandler = (args: RouteTableRenderHandlerArgs) => void;
export type RouteTableRenderHandlerArgs = JSX.Element;
