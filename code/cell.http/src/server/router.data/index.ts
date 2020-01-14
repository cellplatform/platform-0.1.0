import { ERROR, routes, t } from './common';
import * as cell from './route.cell';
import * as cellFile from './route.cell.file';
import * as cellFiles from './route.cell.files';
import * as file from './route.file';
import * as ns from './route.ns';
import { sys } from './route.sys';
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
  cellFile.init(args);
  cellFiles.init(args);

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
    type: ERROR.HTTP.NOT_FOUND,
    message: 'Resource not found.',
  };
  return { status, data };
};
