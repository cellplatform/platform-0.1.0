import { routes, t } from './common';
import * as cell from './route.cell';
import * as cellFile from './route.cell.file';
import * as cellFiles from './route.cell.files';
import * as file from './route.file';
import * as func from './route.func';
import * as ns from './route.ns';
import { sys } from './route.sys';
import { wildcard } from './route.wildcard';

import { crypto } from '../__TMP__/crypto';
import { handleWasmTmp } from '../__TMP__/WasmHandler'; // TEMP 🐷

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
  args.router.get('/tmp/wasm', handleWasmTmp);
  args.router.get('/tmp', async (req) => {
    const length = 130;
    const random = await crypto.random(length);
    return { status: 200, data: { length, random } };
  });

  // No match (404).
  args.router.get(routes.WILDCARD, wildcard);
}
