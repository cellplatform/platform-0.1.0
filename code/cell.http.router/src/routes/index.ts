import { routes, t } from './common';
import * as cell from './route.cell';
import * as cellFile from './route.cell.file';
import * as cellFiles from './route.cell.files';
import * as file from './route.file';
import * as func from './route.func';
import * as ns from './route.ns';
import { sys } from './route.sys';
import { wildcard } from './route.wildcard';

import { tmpWasmHandler } from '../__TMP__/tmpWasmHandler'; // TEMP 🐷
import { tmpHandler } from '../__TMP__/tmpHandler'; // TEMP 🐷

/**
 * Register routes.
 */
export function init(args: {
  db: t.IDb;
  fs: t.IFileSystem;
  router: t.IRouter;
  runtime?: t.RuntimeEnv;
  name?: string;
  deployedAt?: number;
}) {
  // Initialize routes.
  sys.init(args);
  ns.init(args);
  file.init(args);
  cell.init(args);
  cellFile.init(args);
  cellFiles.init(args);
  func.init(args);

  /**
   * TEMP 🐷
   */
  args.router.get('/tmp/wasm', tmpWasmHandler);

  // No match (404).
  args.router.wildcard(wildcard);
}
