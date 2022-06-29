import { t } from './common';
import { match } from 'path-to-regexp';

type MatchFunction = (path: string) => false | MatchFunctionObject;
type MatchFunctionObject = { path: string; index: number; params: t.RouteParams };

/**
 * Manages a table of URL routes.
 */
export function RouteTable(defs?: t.RouteTableDefs): t.RouteTable {
  return toRouteTable({ defs });
}

/**
 * Helpers
 */
function toRouteTable(args: { defs?: t.RouteTableDefs; paths?: t.RouteTablePath[] }): t.RouteTable {
  const routes = [...(args.paths || []), ...toPaths(args.defs)];

  const matchers: { [pattern: string]: MatchFunction } = {};
  const lazyMatcher = (pattern: string) => {
    if (!matchers[pattern]) matchers[pattern] = match(pattern, { decode: decodeURIComponent });
    return matchers[pattern];
  };

  const table: t.RouteTable = {
    kind: 'RouteTable',
    routes,

    /**
     * Declare more routes.
     */
    declare(defs) {
      const keys = Object.keys(defs);
      const existing = routes
        .filter((path) => keys.includes(path.pattern))
        .map((item) => `"${item.pattern}"`);

      if (existing.length > 0) {
        const err = `The following routes have already been declared: ${existing.join(', ')}`;
        throw new Error(err);
      }

      return toRouteTable({ defs, paths: routes }); // <== RECURSION 🌳
    },

    /**
     * Attempt to match the given path with a route.
     */
    match<P>(path: string) {
      for (const item of routes) {
        const { pattern, handler } = item;
        const match = lazyMatcher(pattern)(path);
        if (match) {
          const index = match.index;
          const params = match.params as unknown as P;
          return { path, pattern, index, params, handler };
        }
      }
      return undefined; // Not found.
    },
  };
  return table;
}

function toPaths(input?: t.RouteTableDefs): t.RouteTablePath[] {
  const defs = input ?? {};
  return Object.keys(defs).map((pattern) => {
    return { pattern, handler: defs[pattern] };
  });
}
