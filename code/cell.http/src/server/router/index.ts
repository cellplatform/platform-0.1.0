import { t, routes, ERROR } from './common';
import { sys } from './route.sys';
import * as ns from './route.ns';
import * as file from './route.file';
import * as cell from './route.cell';

import { handleWasmTmp } from './TMP.wasm';

/**
 * Register routes.
 */
export function init(args: {
  db: t.IDb;
  fs: t.IFileSystem;
  router: t.IRouter;
  title?: string;
  deployedAt?: number;
}) {
  // Initialize routes.
  sys.init(args);
  ns.init(args);
  file.init(args);
  cell.init(args);

  // TEMP 🐷
  args.router.get('/wasm', handleWasmTmp); // TEMP 🐷

  // Finish up (wildcard).
  args.router.get(routes.WILDCARD, notFoundHandler);
}

/**
 * 404 - not found (wildcard).
 */
const notFoundHandler: t.RouteHandler = async req => {
  const status = 404;
  const data: t.IHttpError = {
    status,
    type: ERROR.NOT_FOUND,
    message: 'Resource not found.',
  };
  return { status, data };
};
