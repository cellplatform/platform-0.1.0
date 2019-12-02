import { t } from '../common';
import { sys, wildcard } from './route.sys';
import * as ns from './route.ns';
import * as coord from './route.coord';
import * as file from './route.file';

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
  sys.init(args);
  ns.init(args);
  coord.init(args);
  file.init(args);

  args.router.get('/wasm', handleWasmTmp); // TEMP 🐷

  wildcard.init(args);
}

/**
 * TODO 🐷 TEMP
 */
const handleWasmTmp: t.RouteHandler = async req => {
  //
  return { data: { foo: 23 } };
};
