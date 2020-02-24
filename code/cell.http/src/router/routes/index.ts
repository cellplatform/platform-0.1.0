import { ERROR, routes, t } from './common';
import * as cell from './route.cell';
import * as cellFile from './route.cell.file';
import * as cellFiles from './route.cell.files';
import * as file from './route.file';
import * as ns from './route.ns';
import { sys } from './route.sys';
import { wildcard } from './wildcard';

import { handleWasmTmp } from '../../__TMP.wasm'; // TEMP 🐷

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

  // No match.
  args.router.get(routes.WILDCARD, wildcard);
}
